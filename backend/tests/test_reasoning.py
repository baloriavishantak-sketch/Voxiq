"""Tests for Layer 3 Evidence-Based Reasoning and Interview Evaluation."""

import pytest
from backend.app.core.reasoning.synthesizer import FeedbackSynthesizer
from backend.app.core.reasoning.recommendation import evaluate_interview_response
from backend.app.core.reasoning.rubrics import get_interview_question_by_id


def test_feedback_synthesizer_evidence_anchoring():
    metrics_summary = {
        "duration_seconds": 60.0,
        "total_words": 150,
        "wpm": 150.0,
        "filler_count": 8,
        "filler_density": 5.33,
        "fillers_by_token": {"um": 5, "like": 3},
        "pause_count": 4,
        "long_pause_count": 3,
        "average_pause_seconds": 1.4,
        "repetition_rate": 6.2,
        "type_token_ratio": 0.65
    }
    timeline = [
        {"window_start": 0.0, "window_end": 30.0, "wpm": 135.0, "transcript_snippet": "In the beginning we discussed..."},
        {"window_start": 30.0, "window_end": 60.0, "wpm": 165.0, "transcript_snippet": "Finally we conclude that..."}
    ]
    nlp_data = {
        "mean_coherence": 0.42,
        "transitions": [
            {
                "timestamp": 30.5,
                "drift_magnitude": 0.72,
                "from_text": "We start with architecture.",
                "to_text": "Next we examine deployment."
            }
        ]
    }
    transcript_segments = [
        {"segment_index": 0, "text": "We start with architecture."},
        {"segment_index": 1, "text": "Next we examine deployment."}
    ]

    result = FeedbackSynthesizer.synthesize_feedback(
        metrics_summary=metrics_summary,
        timeline=timeline,
        nlp_data=nlp_data,
        transcript_segments=transcript_segments
    )

    assert "items" in result
    assert len(result["items"]) >= 3
    # Check that pacing item specifically references the acceleration from 135 to 165 WPM
    pacing_items = [item for item in result["items"] if item["category"] == "pacing"]
    assert len(pacing_items) >= 1
    assert "135.0 WPM" in pacing_items[0]["message"]
    assert "165.0 WPM" in pacing_items[0]["message"]
    assert pacing_items[0]["evidence_start"] == 30.0


def test_interview_response_evaluation():
    question = get_interview_question_by_id("q-sys-01")
    assert question is not None

    answer_text = (
        "To begin, I would use a Token Bucket algorithm implemented in Redis using Lua scripts for atomicity. "
        "This ensures linear scalability across multiple regional gateways while avoiding race conditions. "
        "If Redis fails, gateways fall back to local in-memory token limits."
    )
    answer_sentences = [
        "To begin, I would use a Token Bucket algorithm implemented in Redis using Lua scripts for atomicity.",
        "This ensures linear scalability across multiple regional gateways while avoiding race conditions.",
        "If Redis fails, gateways fall back to local in-memory token limits."
    ]
    metrics = {"wpm": 142.0, "filler_count": 1}

    eval_result = evaluate_interview_response(
        question_id="q-sys-01",
        answer_text=answer_text,
        answer_sentences=answer_sentences,
        metrics_summary=metrics
    )

    assert eval_result["relevance_score"] > 40.0
    assert eval_result["completeness_score"] >= 40.0
    assert len(eval_result["criteria"]) == len(question["rubric_criteria"])
