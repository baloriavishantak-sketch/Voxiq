"""Temporal Windowing and Communication Dynamics Timeline.

Divides speech into sliding or tumbling time windows to capture pacing acceleration,
hesitation clustering, and structural delivery shifts over time.
"""

from typing import List, Dict, Any
from backend.app.core.metrics.wpm import calculate_wpm
from backend.app.core.metrics.fillers import detect_fillers


def generate_temporal_timeline(
    words_with_timestamps: List[Dict[str, Any]],
    pause_intervals: List[Any],
    total_duration_seconds: float,
    window_duration_seconds: float = 10.0,
    step_duration_seconds: float = 10.0
) -> List[Dict[str, Any]]:
    """Calculates temporal slices of speech dynamics across consecutive time windows."""
    if total_duration_seconds <= 0.0:
        return []

    windows: List[Dict[str, Any]] = []
    current_start = 0.0
    window_idx = 0

    while current_start < total_duration_seconds:
        current_end = min(current_start + window_duration_seconds, total_duration_seconds)
        slice_len = current_end - current_start
        if slice_len <= 1.0 and window_idx > 0:
            break

        # Filter words in window
        window_words = [
            w for w in words_with_timestamps
            if current_start <= w.get("start", 0.0) < current_end
        ]

        # Filter pauses in window
        window_pauses = [
            p for p in pause_intervals
            if (isinstance(p, tuple) and current_start <= p[0] < current_end)
            or (isinstance(p, dict) and current_start <= p.get("start", 0.0) < current_end)
        ]

        # Calculate pause duration in this window
        pause_dur = 0.0
        for p in window_pauses:
            if isinstance(p, tuple):
                pause_dur += p[2]
            elif isinstance(p, dict):
                pause_dur += p.get("duration", 0.0)

        # Active speech duration in window
        active_speech = max(0.5, slice_len - pause_dur)
        wpm_data = calculate_wpm(len(window_words), active_speech, slice_len)
        filler_data = detect_fillers(window_words)

        snippet = " ".join(w.get("word", "") for w in window_words[:12])
        if len(window_words) > 12:
            snippet += "..."

        windows.append({
            "window_index": window_idx,
            "window_start": round(current_start, 2),
            "window_end": round(current_end, 2),
            "wpm": wpm_data["wpm"],
            "word_count": len(window_words),
            "filler_count": filler_data["filler_count"],
            "pause_count": len(window_pauses),
            "pause_duration": round(pause_dur, 2),
            "coherence_score": 1.0,  # Will be enriched by Layer 2 NLP
            "transcript_snippet": snippet
        })

        window_idx += 1
        current_start += step_duration_seconds

    return windows
