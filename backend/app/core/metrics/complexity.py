"""Sentence Structure and Complexity Statistics."""

import re
from typing import List, Dict, Any
import numpy as np


def analyze_sentence_complexity(text: str) -> Dict[str, Any]:
    """Computes transparent structural properties of sentences without black-box scores.
    
    Measures:
        - Words per sentence (mean, median, standard deviation)
        - Long sentence count (> 30 words)
        - Short sentence count (< 5 words)
    """
    raw_sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 0]

    if not sentences:
        return {
            "sentence_count": 0,
            "avg_sentence_length_words": 0.0,
            "median_sentence_length_words": 0.0,
            "std_sentence_length": 0.0,
            "max_sentence_length": 0,
            "min_sentence_length": 0,
            "long_sentences_count": 0,
            "short_sentences_count": 0
        }

    lengths = []
    for s in sentences:
        words = re.findall(r"\b\w+\b", s)
        lengths.append(len(words))

    long_sentences = [l for l in lengths if l > 30]
    short_sentences = [l for l in lengths if l < 5]

    return {
        "sentence_count": len(sentences),
        "avg_sentence_length_words": round(float(np.mean(lengths)), 1),
        "median_sentence_length_words": round(float(np.median(lengths)), 1),
        "std_sentence_length": round(float(np.std(lengths)), 1),
        "max_sentence_length": int(np.max(lengths)),
        "min_sentence_length": int(np.min(lengths)),
        "long_sentences_count": len(long_sentences),
        "short_sentences_count": len(short_sentences)
    }
