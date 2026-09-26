"""Lexical Repetition and Vocabulary Diversity Metrics."""

import re
from typing import List, Dict, Any


COMMON_FUNCTION_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", 
    "of", "with", "by", "from", "up", "about", "into", "over", "after"
}


def analyze_repetition_and_diversity(words: List[str]) -> Dict[str, Any]:
    """Measures lexical n-gram repetition rate and Type-Token Ratio (TTR).
    
    Formula:
        TTR = unique_tokens / total_tokens
        Root TTR = unique_tokens / sqrt(total_tokens)
        Repetition Rate = repeated_token_count / total_tokens * 100
    """
    clean_tokens = [re.sub(r"[^\w]", "", w).lower() for w in words]
    clean_tokens = [w for w in clean_tokens if w]
    total_tokens = len(clean_tokens)

    if total_tokens == 0:
        return {
            "repetition_rate_pct": 0.0,
            "type_token_ratio": 0.0,
            "root_ttr": 0.0,
            "unique_words": 0,
            "total_words": 0,
            "repeated_phrases": []
        }

    unique_tokens = len(set(clean_tokens))
    ttr = round(unique_tokens / total_tokens, 3)
    root_ttr = round(unique_tokens / (total_tokens ** 0.5), 2)

    repeated_phrases = []
    repeated_indices = set()

    # Detect n-gram repetitions for n in [3, 2, 1]
    for n in (3, 2, 1):
        for i in range(total_tokens - (2 * n) + 1):
            if any(idx in repeated_indices for idx in range(i, i + (2 * n))):
                continue
            gram1 = tuple(clean_tokens[i : i + n])
            gram2 = tuple(clean_tokens[i + n : i + (2 * n)])
            if gram1 == gram2:
                for idx in range(i + n, i + (2 * n)):
                    repeated_indices.add(idx)
                repeated_phrases.append({
                    "phrase": " ".join(gram1),
                    "ngram_size": n,
                    "is_function_word": len(gram1) == 1 and gram1[0] in COMMON_FUNCTION_WORDS
                })

    repetition_rate = round((len(repeated_indices) / total_tokens * 100.0), 2)

    return {
        "repetition_rate_pct": repetition_rate,
        "type_token_ratio": ttr,
        "root_ttr": root_ttr,
        "unique_words": unique_tokens,
        "total_words": total_tokens,
        "repeated_phrases": repeated_phrases
    }
