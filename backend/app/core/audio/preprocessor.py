"""Audio Preprocessing Module.

Handles format decoding, channel downmixing, 16kHz rational resampling, 
and loudness normalization without hard-clipping.
"""

import io
from pathlib import Path
from typing import Tuple, Union
import numpy as np
import soundfile as sf
from scipy import signal
from backend.app.utils.logger import logger


class AudioPreprocessor:
    TARGET_SAMPLE_RATE = 16000

    @classmethod
    def load_audio(
        cls, 
        audio_source: Union[str, Path, bytes, np.ndarray], 
        source_sr: int = None
    ) -> Tuple[np.ndarray, int]:
        """Loads audio from a file path, raw bytes, or existing numpy array.
        
        Converts stereo/multichannel to mono and normalizes data to float32 [-1.0, 1.0].
        """
        if isinstance(audio_source, (str, Path)):
            data, sr = sf.read(str(audio_source), dtype="float32")
        elif isinstance(audio_source, bytes):
            buffer = io.BytesIO(audio_source)
            data, sr = sf.read(buffer, dtype="float32")
        elif isinstance(audio_source, np.ndarray):
            data = audio_source.astype(np.float32)
            sr = source_sr or cls.TARGET_SAMPLE_RATE
        else:
            raise ValueError(f"Unsupported audio source type: {type(audio_source)}")

        # Multi-channel downmix to mono
        if data.ndim > 1:
            data = np.mean(data, axis=1)

        # Resample to 16kHz if needed
        if sr != cls.TARGET_SAMPLE_RATE:
            data = cls.resample(data, orig_sr=sr, target_sr=cls.TARGET_SAMPLE_RATE)
            sr = cls.TARGET_SAMPLE_RATE

        # Normalize loudness
        data = cls.normalize_loudness(data)

        return data, sr

    @staticmethod
    def resample(data: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
        """High-fidelity rational resampling using polyphase filtering."""
        if orig_sr == target_sr:
            return data
        # Calculate rational gcd
        gcd = np.gcd(orig_sr, target_sr)
        up = target_sr // gcd
        down = orig_sr // gcd
        resampled = signal.resample_poly(data, up, down)
        return resampled.astype(np.float32)

    @staticmethod
    def normalize_loudness(data: np.ndarray, target_rms_db: float = -20.0) -> np.ndarray:
        """RMS normalization with peak limiting to avoid digital clipping."""
        if len(data) == 0:
            return data

        rms = np.sqrt(np.mean(np.square(data)) + 1e-12)
        current_rms_db = 20 * np.log10(rms)
        gain_db = target_rms_db - current_rms_db
        gain_linear = 10 ** (gain_db / 20)

        normalized = data * gain_linear

        # Peak limiter check: ensure max amplitude does not exceed 0.95
        peak = np.max(np.abs(normalized))
        if peak > 0.95:
            normalized = normalized * (0.95 / peak)

        return normalized.astype(np.float32)

    @classmethod
    def save_wav(cls, data: np.ndarray, output_path: Union[str, Path], sr: int = TARGET_SAMPLE_RATE) -> str:
        """Saves a float32 array as a standard 16-bit PCM WAV file."""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(str(output_path), data, sr, subtype="PCM_16")
        return str(output_path)
