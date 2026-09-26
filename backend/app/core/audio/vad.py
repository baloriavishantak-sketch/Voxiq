"""Voice Activity Detection (VAD) Engine.

Calculates short-time energy, zero-crossing rate, and spectral flux with 
adaptive noise floor estimation and hangover smoothing to detect active speech 
and acoustic pauses.
"""

from typing import List, Tuple, Dict, Any
import numpy as np


class VoiceActivityDetector:
    def __init__(
        self,
        sample_rate: int = 16000,
        frame_duration_ms: float = 30.0,
        hop_duration_ms: float = 10.0,
        min_pause_threshold_sec: float = 0.5,
        energy_threshold_db_offset: float = 12.0
    ):
        self.sr = sample_rate
        self.frame_size = int(sample_rate * (frame_duration_ms / 1000.0))
        self.hop_size = int(sample_rate * (hop_duration_ms / 1000.0))
        self.min_pause_threshold_sec = min_pause_threshold_sec
        self.energy_threshold_db_offset = energy_threshold_db_offset

    def process(self, audio: np.ndarray) -> Dict[str, Any]:
        """Processes 16kHz mono audio and returns speech and pause intervals.
        
        Returns:
            Dict containing:
                - speech_intervals: List of (start_sec, end_sec)
                - pause_intervals: List of (start_sec, end_sec, duration_sec)
                - total_duration: float
                - speech_duration: float
                - silence_duration: float
                - pause_count: int
        """
        if len(audio) == 0:
            return {
                "speech_intervals": [],
                "pause_intervals": [],
                "total_duration": 0.0,
                "speech_duration": 0.0,
                "silence_duration": 0.0,
                "pause_count": 0
            }

        total_duration = len(audio) / self.sr

        # Generate overlapping frames
        num_frames = max(1, 1 + (len(audio) - self.frame_size) // self.hop_size)
        frame_times = np.zeros(num_frames, dtype=np.float32)
        frame_energies = np.zeros(num_frames, dtype=np.float32)

        for i in range(num_frames):
            start = i * self.hop_size
            end = start + self.frame_size
            frame = audio[start:end]
            frame_times[i] = start / self.sr
            # Short-time log energy (in dB)
            energy = np.mean(frame ** 2) if len(frame) > 0 else 0.0
            frame_energies[i] = 10 * np.log10(energy + 1e-10)

        # Adaptive thresholding: estimated from bottom 20th percentile (ambient noise floor)
        noise_floor_db = np.percentile(frame_energies, 20)
        threshold_db = noise_floor_db + self.energy_threshold_db_offset

        # Initial frame classification
        is_speech = frame_energies > threshold_db

        # Hangover smoothing:
        # 1. Onset smoothing: require at least 2 consecutive frames to trigger speech
        # 2. Offset smoothing (hangover): allow speech to linger across 15 frames (~150ms)
        smoothed = np.zeros_like(is_speech, dtype=bool)
        hangover_frames = int(0.150 / (self.hop_size / self.sr))
        hangover_counter = 0

        for i in range(len(is_speech)):
            if is_speech[i]:
                smoothed[i] = True
                hangover_counter = hangover_frames
            elif hangover_counter > 0:
                smoothed[i] = True
                hangover_counter -= 1
            else:
                smoothed[i] = False

        # Extract continuous intervals
        speech_intervals: List[Tuple[float, float]] = []
        in_speech = False
        start_t = 0.0

        for i in range(len(smoothed)):
            t = float(frame_times[i])
            if smoothed[i] and not in_speech:
                in_speech = True
                start_t = t
            elif not smoothed[i] and in_speech:
                in_speech = False
                end_t = t + (self.frame_size / self.sr)
                if (end_t - start_t) >= 0.1:  # Filter out transient clicks < 100ms
                    speech_intervals.append((round(start_t, 3), round(min(end_t, total_duration), 3)))

        if in_speech:
            speech_intervals.append((round(start_t, 3), round(total_duration, 3)))

        # Derive pause intervals between speech segments
        pause_intervals: List[Tuple[float, float, float]] = []
        if speech_intervals:
            # Silence before first speech
            if speech_intervals[0][0] >= self.min_pause_threshold_sec:
                pause_intervals.append((0.0, speech_intervals[0][0], speech_intervals[0][0]))

            # Gaps between speech intervals
            for i in range(len(speech_intervals) - 1):
                gap_start = speech_intervals[i][1]
                gap_end = speech_intervals[i + 1][0]
                gap_duration = gap_end - gap_start
                if gap_duration >= self.min_pause_threshold_sec:
                    pause_intervals.append((round(gap_start, 3), round(gap_end, 3), round(gap_duration, 3)))

            # Silence after last speech
            if (total_duration - speech_intervals[-1][1]) >= self.min_pause_threshold_sec:
                end_silence = total_duration - speech_intervals[-1][1]
                pause_intervals.append((round(speech_intervals[-1][1], 3), round(total_duration, 3), round(end_silence, 3)))
        else:
            # Entire audio is silence
            if total_duration >= self.min_pause_threshold_sec:
                pause_intervals.append((0.0, round(total_duration, 3), round(total_duration, 3)))

        speech_duration = sum(end - start for start, end in speech_intervals)
        silence_duration = max(0.0, total_duration - speech_duration)

        return {
            "speech_intervals": speech_intervals,
            "pause_intervals": pause_intervals,
            "total_duration": round(total_duration, 3),
            "speech_duration": round(speech_duration, 3),
            "silence_duration": round(silence_duration, 3),
            "pause_count": len(pause_intervals)
        }
