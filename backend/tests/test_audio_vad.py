"""Acoustic Preprocessing and VAD Validation Unit Tests."""

import numpy as np
import pytest
from backend.app.core.audio.preprocessor import AudioPreprocessor
from backend.app.core.audio.vad import VoiceActivityDetector


def create_synthetic_signal_with_silence(sr: int = 16000) -> np.ndarray:
    """Generates synthetic audio:
    - 0.0 to 1.0s: 440 Hz Sine Tone (Active Speech proxy)
    - 1.0 to 2.0s: Silence (Pause proxy)
    - 2.0 to 3.5s: 300 Hz Sine Tone (Active Speech proxy)
    - 3.5 to 4.2s: Silence (Pause proxy)
    """
    total_seconds = 4.2
    total_samples = int(sr * total_seconds)
    signal_arr = np.zeros(total_samples, dtype=np.float32)

    # Segment 1: Tone (0.0 to 1.0s)
    t1 = np.linspace(0, 1.0, int(sr * 1.0), endpoint=False)
    signal_arr[0:int(sr * 1.0)] = 0.5 * np.sin(2 * np.pi * 440 * t1)

    # Segment 2: Silence (1.0 to 2.0s) remains 0.0

    # Segment 3: Tone (2.0 to 3.5s)
    t3 = np.linspace(0, 1.5, int(sr * 1.5), endpoint=False)
    signal_arr[int(sr * 2.0):int(sr * 3.5)] = 0.5 * np.sin(2 * np.pi * 300 * t3)

    # Segment 4: Silence (3.5 to 4.2s) remains 0.0

    return signal_arr


def test_audio_preprocessor_resample_and_normalize():
    # Create 8000 Hz signal
    sr_orig = 8000
    t = np.linspace(0, 1.0, sr_orig, endpoint=False)
    orig_signal = 0.2 * np.sin(2 * np.pi * 200 * t)

    processed, new_sr = AudioPreprocessor.load_audio(orig_signal, source_sr=sr_orig)
    assert new_sr == 16000
    assert len(processed) == 16000
    assert np.max(np.abs(processed)) <= 0.96


def test_vad_pause_and_speech_detection():
    sr = 16000
    synthetic_audio = create_synthetic_signal_with_silence(sr=sr)
    
    detector = VoiceActivityDetector(
        sample_rate=sr,
        min_pause_threshold_sec=0.5
    )
    results = detector.process(synthetic_audio)

    # Expected: 2 distinct speech intervals and at least 1 pause around 1.0s -> 2.0s
    assert len(results["speech_intervals"]) >= 2
    assert results["total_duration"] == pytest.approx(4.2, abs=0.1)
    assert results["speech_duration"] >= 2.0
    assert results["silence_duration"] >= 1.0

    # Check pause detection
    pauses = results["pause_intervals"]
    assert len(pauses) >= 1
    # Verify that the central pause (around 1.0s to 2.0s, duration ~ 1.0s) is detected
    central_pauses = [p for p in pauses if 0.8 <= p[0] <= 1.2 and p[2] >= 0.7]
    assert len(central_pauses) == 1
    detected_pause = central_pauses[0]
    assert detected_pause[2] == pytest.approx(1.0, abs=0.25)
