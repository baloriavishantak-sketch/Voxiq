"""Speech-to-Text Transcription Engine with Word-Level Timestamps.

Utilizes Faster-Whisper with automatic hardware acceleration detection 
(CUDA vs CPU int8/float32) and structured timestamped token output.
"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Union, Optional
import numpy as np
import torch
from backend.app.utils.logger import logger


@dataclass
class WordTimestamp:
    word: str
    start: float
    end: float
    probability: float
    is_filler: bool = False


@dataclass
class SegmentTimestamp:
    segment_index: int
    text: str
    start: float
    end: float
    words: List[WordTimestamp] = field(default_factory=list)


@dataclass
class TranscriptionResult:
    full_text: str
    segments: List[SegmentTimestamp] = field(default_factory=list)
    language: str = "en"
    duration: float = 0.0


class SpeechToTextEngine:
    _instance: Optional["SpeechToTextEngine"] = None

    def __init__(self, model_size: str = "base.en"):
        self.model_size = model_size
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.compute_type = "float16" if self.device == "cuda" else "int8"
        self._model = None
        logger.info(f"Initialized STT Engine configuration: model={model_size}, device={self.device}, compute={self.compute_type}")

    @classmethod
    def get_instance(cls, model_size: str = "base.en") -> "SpeechToTextEngine":
        if cls._instance is None:
            cls._instance = cls(model_size=model_size)
        return cls._instance

    @property
    def model(self):
        """Lazy loader for Whisper model to save memory until first inference."""
        if self._model is None:
            from faster_whisper import WhisperModel
            logger.info(f"Loading Faster-Whisper model '{self.model_size}' onto {self.device}...")
            self._model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type
            )
            logger.info("Faster-Whisper model loaded successfully.")
        return self._model

    def transcribe(
        self, 
        audio_input: Union[str, Path, np.ndarray], 
        beam_size: int = 5
    ) -> TranscriptionResult:
        """Transcribes audio with word-level timestamps."""
        segments_raw, info = self.model.transcribe(
            audio_input,
            beam_size=beam_size,
            word_timestamps=True,
            vad_filter=False
        )

        full_text_parts = []
        structured_segments: List[SegmentTimestamp] = []

        for idx, seg in enumerate(segments_raw):
            seg_text = seg.text.strip()
            full_text_parts.append(seg_text)

            words: List[WordTimestamp] = []
            if seg.words:
                for w in seg.words:
                    clean_w = w.word.strip()
                    if clean_w:
                        words.append(WordTimestamp(
                            word=clean_w,
                            start=round(w.start, 3),
                            end=round(w.end, 3),
                            probability=round(w.probability, 3)
                        ))

            structured_segments.append(SegmentTimestamp(
                segment_index=idx,
                text=seg_text,
                start=round(seg.start, 3),
                end=round(seg.end, 3),
                words=words
            ))

        return TranscriptionResult(
            full_text=" ".join(full_text_parts),
            segments=structured_segments,
            language=info.language if hasattr(info, "language") else "en",
            duration=round(info.duration, 3) if hasattr(info, "duration") else 0.0
        )
