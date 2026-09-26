"""Topic Segmentation and Semantic Boundary Transition Detection."""

from typing import List, Dict, Any, Optional
import numpy as np


def detect_topic_transitions(
    sentences: List[str],
    embeddings: np.ndarray,
    timestamps: Optional[List[float]] = None,
    threshold: float = 0.40
) -> List[Dict[str, Any]]:
    """Detects distinct topic shifts when adjacent semantic similarity drops below threshold."""
    n = len(sentences)
    if n <= 1 or embeddings.shape[0] <= 1:
        return []

    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    norm_embeddings = embeddings / norms

    transitions: List[Dict[str, Any]] = []

    for i in range(n - 1):
        cos_sim = float(np.dot(norm_embeddings[i], norm_embeddings[i + 1]))
        if cos_sim < threshold:
            t = timestamps[i + 1] if timestamps and (i + 1) < len(timestamps) else 0.0
            drift_score = round(1.0 - cos_sim, 3)
            transitions.append({
                "transition_index": len(transitions) + 1,
                "timestamp": t,
                "from_sentence_index": i,
                "to_sentence_index": i + 1,
                "from_text": sentences[i],
                "to_text": sentences[i + 1],
                "similarity": round(cos_sim, 3),
                "drift_magnitude": drift_score
            })

    return transitions
