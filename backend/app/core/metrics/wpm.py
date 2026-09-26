"""Deterministic Speaking Rate (WPM) Measurement.

Calculates words per minute strictly based on active speech duration and word counts,
preventing pause skew while also calculating gross WPM for comparison.
"""

from typing import Dict, Any


def calculate_wpm(
    total_words: int, 
    speech_duration_seconds: float, 
    total_duration_seconds: float = None
) -> Dict[str, Any]:
    """Calculates active and gross Words Per Minute (WPM).
    
    Formula:
        Active WPM = total_words / (speech_duration_seconds / 60)
        Gross WPM = total_words / (total_duration_seconds / 60)
    """
    if speech_duration_seconds <= 0.0 or total_words <= 0:
        active_wpm = 0.0
    else:
        active_wpm = round(total_words / (speech_duration_seconds / 60.0), 2)

    if total_duration_seconds and total_duration_seconds > 0.0 and total_words > 0:
        gross_wpm = round(total_words / (total_duration_seconds / 60.0), 2)
    else:
        gross_wpm = active_wpm

    return {
        "wpm": active_wpm,
        "gross_wpm": gross_wpm,
        "total_words": total_words,
        "speech_duration_seconds": round(speech_duration_seconds, 2),
        "total_duration_seconds": round(total_duration_seconds, 2) if total_duration_seconds else round(speech_duration_seconds, 2),
        "calculation_formula": "total_words / (speech_duration_seconds / 60)"
    }
