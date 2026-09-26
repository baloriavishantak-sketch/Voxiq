"""Layer 2 ML & Semantic NLP Analysis Module."""

from backend.app.core.nlp.embeddings import EmbeddingEngine
from backend.app.core.nlp.coherence import compute_semantic_coherence
from backend.app.core.nlp.segmentation import detect_topic_transitions
from backend.app.core.nlp.relevance import evaluate_response_relevance

__all__ = [
    "EmbeddingEngine",
    "compute_semantic_coherence",
    "detect_topic_transitions",
    "evaluate_response_relevance",
]
