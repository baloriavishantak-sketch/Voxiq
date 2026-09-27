"""Tests for Arbitrary-Question Interview Analysis and Multi-Tier Evaluation."""

import pytest
from httpx import AsyncClient
from backend.app.core.reasoning.question_analyzer import QuestionAnalyzer
from backend.app.core.reasoning.recommendation import evaluate_interview_response
from backend.app.core.reasoning.rubrics import get_interview_question_by_id


def test_question_analyzer_classification_types():
    # 1. System Design
    sys_q = "How would you design a distributed cache cluster handling millions of writes with Redis?"
    sys_res = QuestionAnalyzer.analyze_question(sys_q)
    assert sys_res["question_type"] == "system_design"
    assert len(sys_res["major_concepts"]) >= 2
    assert len(sys_res["expected_points"]) >= 3
    assert len(sys_res["rubric_criteria"]) >= 3
    assert sys_res["has_ground_truth"] is False
    assert sys_res["technical_correctness_status"] == "unverified"
    assert "cannot verify" in sys_res["technical_correctness_disclaimer"].lower()

    # 2. Algorithmic
    algo_q = "Explain the time complexity and space complexity of quicksort with worst case pivot selection."
    algo_res = QuestionAnalyzer.analyze_question(algo_q)
    assert algo_res["question_type"] == "algorithmic"
    assert "time complexity" in [c.lower() for c in algo_res["major_concepts"]] or "quicksort" in [c.lower() for c in algo_res["major_concepts"]]

    # 3. Comparative Trade-off
    comp_q = "Compare relational PostgreSQL with NoSQL MongoDB in terms of ACID transactions and schema migrations."
    comp_res = QuestionAnalyzer.analyze_question(comp_q)
    assert comp_res["question_type"] == "comparative_tradeoff"

    # 4. Behavioral
    behav_q = "Tell me about a time you had a technical disagreement with a senior engineer and how you resolved it."
    behav_res = QuestionAnalyzer.analyze_question(behav_q)
    assert behav_res["question_type"] == "behavioral_leadership"


def test_question_analyzer_mmr_concept_extraction():
    q = "How does Raft consensus handle network partitions and split-brain leader elections?"
    concepts = QuestionAnalyzer.extract_concepts_mmr(q, top_k=4)
    assert len(concepts) >= 2
    concept_str = " ".join(concepts).lower()
    # Should extract key technical tokens
    assert any(term in concept_str for term in ["raft", "consensus", "network partitions", "leader", "elections"])


def test_arbitrary_question_evaluation_tiered_reporting():
    custom_question = QuestionAnalyzer.analyze_question(
        "How do you optimize tail latency in a microservices architecture using gRPC and connection pooling?"
    )

    answer_sentences = [
        "To begin, tail latency in microservices is heavily influenced by TCP connection churn and head-of-line blocking.",
        "By utilizing gRPC with HTTP/2 multiplexing and persistent connection pooling, we eliminate handshake overhead.",
        "Furthermore, implementing adaptive timeouts, circuit breaking, and hedging duplicate requests stabilizes p99 latency.",
        "In conclusion, connection pooling combined with request hedging provides predictable tail performance under peak loads."
    ]
    answer_text = " ".join(answer_sentences)
    metrics = {
        "wpm": 148.0,
        "filler_count": 2,
        "filler_density": 2.5,
        "pause_count": 3,
        "average_pause_seconds": 0.8
    }

    eval_result = evaluate_interview_response(
        answer_text=answer_text,
        answer_sentences=answer_sentences,
        metrics_summary=metrics,
        custom_question=custom_question
    )

    # 1. Verification of Scores
    assert eval_result["relevance_score"] > 40.0
    assert eval_result["completeness_score"] >= 25.0
    assert eval_result["structure_score"] >= 70.0  # has intro, conclusion, transitions, variety

    # 2. Strict Scientific Distinction Check
    assert eval_result["has_ground_truth"] is False
    assert eval_result["technical_correctness_status"] == "unverified"
    assert "cannot verify" in eval_result["technical_correctness_disclaimer"].lower()
    assert "Unverified" in eval_result["summary_feedback"]

    # 3. Concept Coverage Verification
    assert "concept_coverage" in eval_result
    assert len(eval_result["concept_coverage"]) > 0
    first_concept = eval_result["concept_coverage"][0]
    assert "concept" in first_concept
    assert "coverage_score" in first_concept
    assert "is_covered" in first_concept

    # 4. Structure Breakdown Verification
    assert eval_result["structure_breakdown"]["has_introductory_framing"] is True
    assert eval_result["structure_breakdown"]["has_concluding_synthesis"] is True
    assert eval_result["structure_breakdown"]["has_signposted_transitions"] is True


@pytest.mark.asyncio
async def test_interview_endpoints_with_custom_question(client: AsyncClient):
    # 1. Analyze arbitrary question endpoint
    custom_prompt = "Explain how Kubernetes Horizontal Pod Autoscaler calculates replica counts from metric thresholds."
    analyze_res = await client.post(
        "/api/v1/interview/analyze-question",
        json={"prompt": custom_prompt, "category": "Cloud & Infrastructure"}
    )
    assert analyze_res.status_code == 200
    q_data = analyze_res.json()
    assert q_data["is_custom"] is True
    assert len(q_data["major_concepts"]) >= 2
    assert len(q_data["expected_points"]) >= 3
    assert q_data["has_ground_truth"] is False
    assert q_data["technical_correctness_status"] == "unverified"

    # 2. Create session
    sess_res = await client.post(
        "/api/v1/sessions",
        json={"title": "Custom Interview Test", "mode": "interview"}
    )
    assert sess_res.status_code == 201
    session_id = sess_res.json()["id"]

    # 3. Evaluate session with custom_question payload
    eval_res = await client.post(
        "/api/v1/interview/evaluate",
        json={
            "session_id": session_id,
            "question_id": q_data["id"],
            "custom_question": q_data
        }
    )
    assert eval_res.status_code == 200
    eval_body = eval_res.json()
    assert eval_body["session_id"] == session_id
    assert eval_body["has_ground_truth"] is False
    assert eval_body["technical_correctness_status"] == "unverified"
    assert "criteria" in eval_body
    assert "concept_coverage" in eval_body
