"""Configurable Filler-Word Detection and Density Analysis."""

import re
from typing import List, Dict, Any, Optional


DEFAULT_FILLER_LEXICON = [
    "um", "uh", "er", "ah", "like", "you know", "sort of", 
    "kind of", "actually", "basically", "so yeah", "i mean", 
    "right", "you see", "honestly"
]


def detect_fillers(
    words_with_timestamps: List[Dict[str, Any]], 
    lexicon: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Detects exact single-word and multi-word filler occurrences in timestamped speech tokens.
    
    Args:
        words_with_timestamps: List of dicts with 'word', 'start', 'end'
        lexicon: Optional custom list of filler words or phrases
    """
    lexicon = [f.lower().strip() for f in (lexicon or DEFAULT_FILLER_LEXICON)]
    # Separate single-token and multi-token fillers
    single_token_fillers = {f for f in lexicon if " " not in f}
    multi_token_fillers = [f for f in lexicon if " " in f]

    total_words = len(words_with_timestamps)
    detected_fillers: List[Dict[str, Any]] = []
    filler_counts_by_token: Dict[str, int] = {}

    cleaned_words = []
    for w in words_with_timestamps:
        raw_text = w.get("word", "")
        # Clean leading/trailing punctuation but preserve internal hyphens/apostrophes
        clean_word = re.sub(r"^[^\w]+|[^\w]+$", "", raw_text).lower()
        cleaned_words.append({
            "clean": clean_word,
            "start": w.get("start", 0.0),
            "end": w.get("end", 0.0),
            "raw": raw_text
        })

    # 1. Match multi-word fillers first (e.g. 'you know', 'sort of')
    matched_indices = set()
    for phrase in multi_token_fillers:
        tokens = phrase.split()
        n = len(tokens)
        for i in range(len(cleaned_words) - n + 1):
            window_slice = [cleaned_words[i + k]["clean"] for k in range(n)]
            if window_slice == tokens and not any((i + k) in matched_indices for k in range(n)):
                for k in range(n):
                    matched_indices.add(i + k)
                start_t = cleaned_words[i]["start"]
                end_t = cleaned_words[i + n - 1]["end"]
                detected_fillers.append({
                    "word": phrase,
                    "start": round(start_t, 2),
                    "end": round(end_t, 2),
                    "type": "multi_word"
                })
                filler_counts_by_token[phrase] = filler_counts_by_token.get(phrase, 0) + 1

    # 2. Match single-word fillers
    for i, item in enumerate(cleaned_words):
        if i in matched_indices:
            continue
        clean_w = item["clean"]
        if clean_w in single_token_fillers:
            matched_indices.add(i)
            detected_fillers.append({
                "word": clean_w,
                "start": round(item["start"], 2),
                "end": round(item["end"], 2),
                "type": "single_word"
            })
            filler_counts_by_token[clean_w] = filler_counts_by_token.get(clean_w, 0) + 1

    filler_count = len(detected_fillers)
    filler_density = round((filler_count / total_words * 100.0), 2) if total_words > 0 else 0.0

    return {
        "filler_count": filler_count,
        "total_words": total_words,
        "filler_density_pct": filler_density,
        "fillers_by_token": filler_counts_by_token,
        "detected_fillers": sorted(detected_fillers, key=lambda x: x["start"]),
        "formula": "(filler_count / total_words) * 100"
    }
