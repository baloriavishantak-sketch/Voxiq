"""Real-Time Audio Streaming WebSocket Endpoint.

Handles incremental audio chunk ingestion, live frame-level VAD, 
incremental metric calculation, and live state broadcasts.
"""

import io
import json
import numpy as np
import soundfile as sf
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.core.audio.preprocessor import AudioPreprocessor
from backend.app.core.audio.vad import VoiceActivityDetector
from backend.app.core.metrics.wpm import calculate_wpm
from backend.app.core.metrics.fillers import detect_fillers
from backend.app.utils.logger import logger

router = APIRouter(tags=["Realtime Streaming"])


class StreamingAudioSession:
    def __init__(self, session_id: str, sample_rate: int = 16000):
        self.session_id = session_id
        self.sr = sample_rate
        self.buffer = bytearray()
        self.total_samples_received = 0
        self.vad = VoiceActivityDetector(sample_rate=sample_rate, min_pause_threshold_sec=0.5)

    def append_chunk(self, raw_bytes: bytes):
        self.buffer.extend(raw_bytes)
        self.total_samples_received += len(raw_bytes) // 2  # Assuming 16-bit PCM

    def get_audio_array(self) -> np.ndarray:
        if len(self.buffer) < 4:
            return np.empty(0, dtype=np.float32)
        # Parse 16-bit PCM
        raw_int16 = np.frombuffer(self.buffer, dtype=np.int16)
        float_samples = raw_int16.astype(np.float32) / 32768.0
        return float_samples


@router.websocket("/ws/audio/{session_id}")
async def websocket_audio_stream(websocket: WebSocket, session_id: str):
    """Bidirectional streaming WebSocket for real-time speech telemetry."""
    await websocket.accept()
    stream_session = StreamingAudioSession(session_id=session_id)
    logger.info(f"WebSocket client connected for real-time streaming: session={session_id}")

    try:
        while True:
            message = await websocket.receive()
            if "bytes" in message and message["bytes"]:
                chunk = message["bytes"]
                stream_session.append_chunk(chunk)
                audio_arr = stream_session.get_audio_array()

                if len(audio_arr) >= stream_session.sr * 1.0:  # Compute telemetry every ~1 second of accumulated audio
                    vad_data = stream_session.vad.process(audio_arr)
                    total_sec = vad_data["total_duration"]
                    speech_sec = vad_data["speech_duration"]
                    silence_sec = vad_data["silence_duration"]

                    # Check current speech state from latest frames
                    is_speaking = False
                    if vad_data["speech_intervals"]:
                        last_speech_end = vad_data["speech_intervals"][-1][1]
                        is_speaking = (total_sec - last_speech_end) < 0.35

                    current_pause_sec = 0.0
                    if not is_speaking and vad_data["pause_intervals"]:
                        current_pause_sec = vad_data["pause_intervals"][-1][2]

                    # Broadcast telemetry packet
                    telemetry = {
                        "type": "telemetry",
                        "session_id": session_id,
                        "timestamp": round(total_sec, 2),
                        "state": "speaking" if is_speaking else "pause",
                        "current_pause_seconds": round(current_pause_sec, 2),
                        "total_speech_seconds": round(speech_sec, 2),
                        "total_duration_seconds": round(total_sec, 2),
                        "pause_count": vad_data["pause_count"]
                    }
                    await websocket.send_text(json.dumps(telemetry))

            elif "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                    action = payload.get("action")
                    if action == "stop":
                        logger.info(f"Streaming stopped by client: session={session_id}")
                        await websocket.send_text(json.dumps({
                            "type": "completed",
                            "session_id": session_id,
                            "total_samples": stream_session.total_samples_received
                        }))
                        break
                except json.JSONDecodeError:
                    pass

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: session={session_id}")
    except Exception as e:
        logger.error(f"WebSocket streaming error: {e}", exc_info=True)
        await websocket.close()
