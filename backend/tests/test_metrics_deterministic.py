"""Exhaustive tests for Layer 1 Deterministic Communication Metrics."""

import pytest
from backend.app.core.metrics.wpm import calculate_wpm
from backend.app.core.metrics.pauses import analyze_pauses
from backend.app.core.metrics.fillers import detect_fillers
from backend.app.core.metrics.repetition import analyze_repetition_and_diversity
from backend.app.core.metrics.complexity import analyze_sentence_complexity
from backend.app.core.metrics.temporal import generate_temporal_timeline


def test_wpm_calculation():
    # 150 words spoken in exactly 60 active speech seconds => 150.0 WPM
    res1 = calculate_wpm(total_words=150, speech_duration_seconds=60.0, total_duration_seconds=75.0)
    assert res1["wpm"] == 150.0
    assert res1["gross_wpm"] == 120.0

    # Edge cases: 0 speech duration or 0 words
    res_zero = calculate_wpm(total_words=0, speech_duration_seconds=0.0)
    assert res_zero["wpm"] == 0.0


def test_pause_analysis():
    pauses = [
        (1.0, 1.6, 0.6),    # Normal pause
        (5.0, 6.8, 1.8),    # Long pause
        (10.0, 10.8, 0.8),  # Normal pause
    ]
    res = analyze_pauses(pauses, long_pause_threshold_sec=1.2)
    assert res["pause_count"] == 3
    assert res["long_pause_count"] == 1
    assert res["total_pause_duration"] == pytest.approx(3.2, abs=0.01)
    assert res["average_pause_seconds"] == pytest.approx(1.07, abs=0.01)
    assert res["max_pause_seconds"] == 1.8


def test_filler_detection_single_and_multi_word():
    tokens = [
        {"word": "Well", "start": 0.0, "end": 0.3},
        {"word": "um,", "start": 0.4, "end": 0.7},
        {"word": "I", "start": 0.8, "end": 0.9},
        {"word": "think", "start": 1.0, "end": 1.2},
        {"word": "you", "start": 1.3, "end": 1.5},
        {"word": "know", "start": 1.5, "end": 1.8},
        {"word": "it", "start": 1.9, "end": 2.1},
        {"word": "is", "start": 2.2, "end": 2.3},
        {"word": "basically", "start": 2.4, "end": 2.9},
        {"word": "working.", "start": 3.0, "end": 3.5},
    ]
    # Total words = 10. Fillers: "um", "you know" (2 tokens matched as 1 phrase), "basically" => 3 filler instances
    res = detect_fillers(tokens)
    assert res["filler_count"] == 3
    assert res["filler_density_pct"] == 30.0
    assert "um" in res["fillers_by_token"]
    assert "you know" in res["fillers_by_token"]
    assert "basically" in res["fillers_by_token"]


def test_lexical_repetition_and_diversity():
    words = ["we", "need", "to", "we", "need", "to", "build", "the", "system", "robustly"]
    res = analyze_repetition_and_diversity(words)
    assert res["total_words"] == 10
    assert res["unique_words"] == 7
    assert res["type_token_ratio"] == 0.7
    assert res["repetition_rate_pct"] > 0.0


def test_sentence_complexity():
    text = "VOXIQ is an advanced communication intelligence platform. It analyzes real-time speech without fake metrics! Does it provide evidence-based insights?"
    res = analyze_sentence_complexity(text)
    assert res["sentence_count"] == 3
    assert res["avg_sentence_length_words"] > 0.0
    assert res["max_sentence_length"] >= res["min_sentence_length"]


def test_temporal_timeline_generation():
    tokens = [
        {"word": f"word_{i}", "start": float(i), "end": float(i) + 0.4}
        for i in range(70)
    ]
    pauses = [(10.0, 11.5, 1.5), (35.0, 36.8, 1.8)]
    timeline = generate_temporal_timeline(
        words_with_timestamps=tokens,
        pause_intervals=pauses,
        total_duration_seconds=70.0,
        window_duration_seconds=30.0,
        step_duration_seconds=15.0
    )
    assert len(timeline) >= 3
    assert timeline[0]["window_start"] == 0.0
    assert timeline[0]["window_end"] == 30.0
    assert timeline[0]["wpm"] > 0
