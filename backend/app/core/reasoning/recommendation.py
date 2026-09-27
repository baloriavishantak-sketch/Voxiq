"""Evidence-Linked Rubric Evaluator for Interview Mode.

Evaluates spoken answers across three scientifically distinct tiers:
1. Communication Analysis (Acoustic pacing, pause structure, filler density)
2. Semantic & Content Coverage (Key concept coverage, topical relevance, structural progression)
3. Technical Correctness Status (Explicitly unverified for arbitrary questions without reference)
"""

from typing import List, Dict, Any, Optional
import numpy as np
from backend.app.core.reasoning.rubrics import get_interview_question_by_id, register_custom_question
from backend.app.core.reasoning.question_analyzer import QuestionAnalyzer
from backend.app.core.nlp.embeddings import EmbeddingEngine
from backend.app.core.nlp.relevance import evaluate_response_relevance


INTRO_MARKERS = (
    "to begin", "first", "firstly", "in order to", "essentially", "at a high level",
    "the primary", "to start", "my approach", "when considering", "speaking generally",
    "fundamentally", "the main", "in this scenario"
)

CONCLUSION_MARKERS = (
    "in conclusion", "overall", "ultimately", "therefore", "in summary", "to conclude",
    "to wrap up", "as a result", "in the end", "that summarizes", "in short"
)

TRANSITION_MARKERS = (
    "furthermore", "secondly", "in contrast", "moreover", "on the other hand",
    "specifically", "additionally", "for instance", "for example", "next",
    "another key aspect", "from a performance perspective", "in terms of"
)


def evaluate_interview_response(
    question_id: Optional[str] = None,
    answer_text: str = "",
    answer_sentences: Optional[List[str]] = None,
    metrics_summary: Optional[Dict[str, Any]] = None,
    custom_question: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Evaluates an interview response strictly against preset or dynamic rubric criteria.
    
    Supports both preset question IDs and arbitrary user-submitted questions.
    Delineates communication, semantic coverage, and technical correctness.
    """
    sentences = answer_sentences or []
    metrics = metrics_summary or {}

    # 1. Resolve question data
    q_data: Optional[Dict[str, Any]] = None

    if custom_question:
        # Check if already analyzed
        if "expected_points" in custom_question and "rubric_criteria" in custom_question:
            q_data = custom_question
        else:
            prompt = custom_question.get("prompt", "")
            cat = custom_question.get("category")
            q_data = QuestionAnalyzer.analyze_question(prompt, category_hint=cat)
        register_custom_question(q_data)
        qid = q_data["id"]
    elif question_id:
        q_data = get_interview_question_by_id(question_id)
        if not q_data:
            raise ValueError(f"Unknown interview question ID: {question_id}")
        qid = question_id
    else:
        raise ValueError("Either 'question_id' or 'custom_question' must be provided.")

    expected_points = q_data.get("expected_points", [])
    rubric_criteria = q_data.get("rubric_criteria", [])
    major_concepts = q_data.get("major_concepts", [])
    question_prompt = q_data.get("prompt", "")
    has_ground_truth = q_data.get("has_ground_truth", False)

    # 2. Semantic Relevance and Expected Points Coverage
    engine = EmbeddingEngine.get_instance()
    nlp_eval = evaluate_response_relevance(
        question_text=question_prompt,
        answer_sentences=sentences,
        expected_points=expected_points,
        embedding_engine=engine
    )

    relevance_score = nlp_eval["overall_relevance_score"]
    coverage_pct = nlp_eval["rubric_coverage_pct"]
    points_coverage = nlp_eval.get("points_coverage", [])

    # 3. Major Concept Coverage (KeyBERT Concepts)
    concept_coverage_list: List[Dict[str, Any]] = []
    if major_concepts and sentences:
        concept_embs = engine.encode(major_concepts)
        ans_embs = engine.encode(sentences)
        sim_mat = np.dot(concept_embs, ans_embs.T)

        for i, concept in enumerate(major_concepts):
            max_sim = float(np.max(sim_mat[i]))
            best_idx = int(np.argmax(sim_mat[i]))
            is_covered = max_sim >= 0.48
            concept_coverage_list.append({
                "concept": concept,
                "coverage_score": round(max_sim, 3),
                "is_covered": is_covered,
                "evidence_sentence": sentences[best_idx] if sentences else None
            })
    elif major_concepts:
        for concept in major_concepts:
            concept_coverage_list.append({
                "concept": concept,
                "coverage_score": 0.0,
                "is_covered": False,
                "evidence_sentence": None
            })

    # 4. Structure & Organization Analysis
    lower_sentences = [s.lower() for s in sentences]
    has_intro = any(any(s.startswith(m) or m in s[:30] for m in INTRO_MARKERS) for s in lower_sentences[:2]) if lower_sentences else False
    has_conclusion = any(any(s.startswith(m) or m in s for m in CONCLUSION_MARKERS) for s in lower_sentences[-2:]) if len(lower_sentences) >= 2 else False
    has_transitions = any(any(m in s for m in TRANSITION_MARKERS) for s in lower_sentences) if lower_sentences else False
    sentence_variety = len(sentences) >= 3

    structure_score = 0.40
    if has_intro:
        structure_score += 0.20
    if has_conclusion:
        structure_score += 0.20
    if has_transitions:
        structure_score += 0.10
    if sentence_variety:
        structure_score += 0.10
    structure_score = min(1.0, structure_score)

    structure_breakdown = {
        "has_introductory_framing": has_intro,
        "has_concluding_synthesis": has_conclusion,
        "has_signposted_transitions": has_transitions,
        "sentence_variety": sentence_variety,
        "total_spoken_sentences": len(sentences)
    }

    # 5. Rubric Criteria Evaluations
    criteria_evals: List[Dict[str, Any]] = []
    for idx, crit in enumerate(rubric_criteria):
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
            feedback = f"General evaluation of '{crit.get('criterion', 'criterion')}'."
            evidence = sentences[0] if sentences else ""

        criteria_evals.append({
            "criterion": crit.get("criterion", f"Criterion {idx+1}"),
            "score": score,
            "evidence": evidence,
            "feedback": feedback
        })

    # 6. Scientific Status & Disclaimers
    if has_ground_truth:
        correctness_status = "preset_rubric_evaluated"
        correctness_disclaimer = (
            "Evaluated against VOXIQ standard reference rubric for verified preset questions."
        )
    else:
        correctness_status = "unverified"
        correctness_disclaimer = (
            "Semantic coverage verifies topical relevance and conceptual alignment, "
            "but cannot verify mathematical, algorithmic, or factual correctness without "
            "a verified reference solution."
        )

    correctness_label = "Verified via Preset Reference" if has_ground_truth else "Unverified (No Ground Truth Reference)"

    summary_feedback = (
        f"Semantic relevance score: {round(relevance_score * 100, 1)}%. "
        f"Rubric point coverage: {coverage_pct}%. "
        f"Structure quality: {round(structure_score * 100, 1)}%. "
        f"Technical correctness: {correctness_label}. "
        f"Delivery pacing: {metrics.get('wpm', 0.0)} WPM with {metrics.get('filler_count', 0)} filler words."
    )

    return {
        "question_id": qid,
        "relevance_score": round(relevance_score * 100, 1),
        "completeness_score": coverage_pct,
        "structure_score": round(structure_score * 100, 1),
        "criteria": criteria_evals,
        "summary_feedback": summary_feedback,
        # Extended multi-tier fields
        "question_type": q_data.get("question_type"),
        "major_concepts": major_concepts,
        "concept_coverage": concept_coverage_list,
        "communication_metrics": {
            "wpm": metrics.get("wpm", 0.0),
            "filler_count": metrics.get("filler_count", 0),
            "filler_density": metrics.get("filler_density", 0.0),
            "pause_count": metrics.get("pause_count", 0),
            "average_pause_seconds": metrics.get("average_pause_seconds", 0.0)
        },
        "structure_breakdown": structure_breakdown,
        "has_ground_truth": has_ground_truth,
        "technical_correctness_status": correctness_status,
        "technical_correctness_disclaimer": correctness_disclaimer
    }
