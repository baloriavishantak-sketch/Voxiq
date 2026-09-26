"""Semantic Coherence Measurement across Contiguous Speech."""

from typing import List, Dict, Any, Optional
import numpy as np


def compute_semantic_coherence(
    sentences: List[str], 
    embeddings: np.ndarray,
    timestamps: Optional[List[float]] = None
) -> Dict[str, Any]:
    """Calculates adjacent pairwise cosine similarity and centroid coherence.
    
    Formula:
        Adjacent Coherence = (e_i . e_{i+1}) / (||e_i|| * ||e_{i+1}||)
    """
    n = len(sentences)
    if n <= 1 or embeddings.shape[0] <= 1:
        return {
        "mean_coherence": None,
        "min_coherence": None,
        "pairwise_coherence": [],
        "sentence_scores": [],
        "insufficient_data": True
    }

    # Ensure L2 normalized vectors for fast dot product
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    norm_embeddings = embeddings / norms

    # Pairwise adjacent cosine similarities
    pairwise = []
    for i in range(n - 1):
        cos_sim = float(np.dot(norm_embeddings[i], norm_embeddings[i + 1]))
        # Clamp to [-1.0, 1.0] to prevent float drift
        cos_sim = max(-1.0, min(1.0, cos_sim))
        t = timestamps[i] if timestamps and i < len(timestamps) else 0.0
        pairwise.append({
            "from_index": i,
            "to_index": i + 1,
            "similarity": round(cos_sim, 3),
            "timestamp": t
        })

    sim_values = [p["similarity"] for p in pairwise]
    mean_coherence = round(float(np.mean(sim_values)), 3)
    min_coherence = round(float(np.min(sim_values)), 3)

    return {
        "mean_coherence": mean_coherence,
        "min_coherence": min_coherence,
        "pairwise_coherence": pairwise
    }
