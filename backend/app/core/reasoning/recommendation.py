"""Evidence-Linked Rubric Evaluator for Interview Mode."""

from typing import List, Dict, Any, Optional
from backend.app.core.reasoning.rubrics import get_interview_question_by_id
from backend.app.core.nlp.relevance import evaluate_response_relevance


def evaluate_interview_response(
    question_id: str,
    answer_text: str,
    answer_sentences: List[str],
    metrics_summary: Dict[str, Any]
) -> Dict[str, Any]:
    """Evaluates an interview response strictly against the question's rubric criteria."""
    q_data = get_interview_question_by_id(question_id)
    if not q_data:
        raise ValueError(f"Unknown interview question ID: {question_id}")

    expected_points = q_data.get("expected_points", [])
    rubric_criteria = q_data.get("rubric_criteria", [])

    # Evaluate semantic coverage
    nlp_eval = evaluate_response_relevance(
        question_text=q_data["prompt"],
        answer_sentences=answer_sentences,
        expected_points=expected_points
    )

    relevance_score = nlp_eval["overall_relevance_score"]
    coverage_pct = nlp_eval["rubric_coverage_pct"]

    # Structure score evaluated via sentence length distribution and presence of introductory/concluding markers
    has_intro = any(s.lower().startswith(("to begin", "first", "in order to", "essentially", "at a high level")) for s in answer_sentences[:2])
    has_conclusion = any(s.lower().startswith(("in conclusion", "overall", "ultimately", "therefore", "in summary")) for s in answer_sentences[-2:])
    structure_score = 0.5 + (0.25 if has_intro else 0.0) + (0.25 if has_conclusion else 0.0)

    # Criteria evaluations
    criteria_evals: List[Dict[str, Any]] = []
    points_coverage = nlp_eval.get("points_coverage", [])

    for idx, crit in enumerate(rubric_criteria):
        # Map criterion to matching expected point
        matching_point = points_coverage[idx] if idx < len(points_coverage) else None
        if matching_point and matching_point["is_covered"]:
            score = 1.0
            feedback = f"Successfully addressed: '{matching_point['point']}'"
            evidence = matching_point["best_matching_sentence"]
        elif matching_point:
            score = round(matching_point["coverage_score"], 2)
            feedback = f"Partially addressed or omitted key aspect: '{matching_point['point']}'"
            evidence = matching_point["best_matching_sentence"]
        else:
            score = 0.5
            feedback = "General coverage evaluated."
            evidence = answer_sentences[0] if answer_sentences else ""

        criteria_evals.append({
            "criterion": crit["criterion"],
            "score": score,
            "evidence": evidence,
            "feedback": feedback
        })

    summary_feedback = (
        f"Technical relevance score: {round(relevance_score * 100, 1)}%. "
        f"Rubric point coverage: {coverage_pct}%. "
        f"Delivery pacing: {metrics_summary.get('wpm', 0.0)} WPM with {metrics_summary.get('filler_count', 0)} filler words."
    )

    return {
        "question_id": question_id,
        "relevance_score": round(relevance_score * 100, 1),
        "completeness_score": coverage_pct,
        "structure_score": round(structure_score * 100, 1),
        "criteria": criteria_evals,
        "summary_feedback": summary_feedback
    }
