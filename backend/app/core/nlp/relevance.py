"""Question-to-Answer Semantic Relevance and Rubric Coverage."""

from typing import List, Dict, Any, Optional
import numpy as np
from backend.app.core.nlp.embeddings import EmbeddingEngine


def evaluate_response_relevance(
    question_text: str,
    answer_sentences: List[str],
    expected_points: Optional[List[str]] = None,
    embedding_engine: Optional[EmbeddingEngine] = None
) -> Dict[str, Any]:
    """Measures semantic alignment between an interview prompt and the spoken response.
    
    Computes:
        - Overall question-to-answer semantic similarity
        - Rubric coverage: maximum similarity of each expected key point to any spoken sentence
    """
    if not answer_sentences:
        return {
            "overall_relevance_score": 0.0,
            "rubric_coverage_pct": 0.0,
            "points_coverage": []
        }

    engine = embedding_engine or EmbeddingEngine.get_instance()

    # Encode question and all answer sentences
    q_emb = engine.encode(question_text)  # (1, 384)
    ans_embs = engine.encode(answer_sentences)  # (k, 384)

    # Question-to-sentences similarities
    q_sims = np.dot(ans_embs, q_emb.T).flatten()
    # Mean of top 50% most relevant sentences in the answer to avoid penalizing long thorough explanations
    top_k = max(1, len(q_sims) // 2)
    top_sims = np.sort(q_sims)[-top_k:]
    overall_relevance = round(float(np.mean(top_sims)), 3)

    # Rubric coverage
    points_coverage: List[Dict[str, Any]] = []
    if expected_points:
        point_embs = engine.encode(expected_points)  # (m, 384)
        # Similarity matrix: (m, k)
        sim_matrix = np.dot(point_embs, ans_embs.T)
        for i, pt in enumerate(expected_points):
            max_sim = float(np.max(sim_matrix[i]))
            best_match_idx = int(np.argmax(sim_matrix[i]))
            covered = max_sim >= 0.50
            points_coverage.append({
                "point": pt,
                "coverage_score": round(max_sim, 3),
                "is_covered": covered,
                "best_matching_sentence": answer_sentences[best_match_idx]
            })

        covered_count = sum(1 for p in points_coverage if p["is_covered"])
        coverage_pct = round((covered_count / len(expected_points)) * 100.0, 1)
    else:
        coverage_pct = 100.0

    return {
        "overall_relevance_score": overall_relevance,
        "rubric_coverage_pct": coverage_pct,
        "points_coverage": points_coverage
    }
