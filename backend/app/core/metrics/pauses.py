"""Acoustic Pause Statistics and Distribution Analysis."""

from typing import List, Tuple, Dict, Any
import numpy as np


def analyze_pauses(
    pause_intervals: List[Tuple[float, float, float]],
    long_pause_threshold_sec: float = 1.2
) -> Dict[str, Any]:
    """Computes transparent statistics on detected pauses.
    
    Args:
        pause_intervals: List of (start_sec, end_sec, duration_sec)
        long_pause_threshold_sec: Cutoff duration considered a 'long' hesitation pause
    """
    if not pause_intervals:
        return {
            "pause_count": 0,
            "long_pause_count": 0,
            "total_pause_duration": 0.0,
            "average_pause_seconds": 0.0,
            "median_pause_seconds": 0.0,
            "max_pause_seconds": 0.0,
            "pauses": []
        }

    durations = [p[2] for p in pause_intervals]
    long_pauses = [p for p in pause_intervals if p[2] >= long_pause_threshold_sec]

    formatted_pauses = [
        {
            "start": round(p[0], 2),
            "end": round(p[1], 2),
            "duration": round(p[2], 2),
            "is_long": p[2] >= long_pause_threshold_sec
        }
        for p in pause_intervals
    ]

    return {
        "pause_count": len(pause_intervals),
        "long_pause_count": len(long_pauses),
        "total_pause_duration": round(float(sum(durations)), 2),
        "average_pause_seconds": round(float(np.mean(durations)), 2),
        "median_pause_seconds": round(float(np.median(durations)), 2),
        "max_pause_seconds": round(float(np.max(durations)), 2),
        "long_pause_threshold": long_pause_threshold_sec,
        "pauses": formatted_pauses
    }
