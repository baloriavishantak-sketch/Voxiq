"""Validation tests for Layer 2 ML & Semantic NLP."""

import pytest
import numpy as np
from backend.app.core.nlp.embeddings import EmbeddingEngine
from backend.app.core.nlp.coherence import compute_semantic_coherence
from backend.app.core.nlp.segmentation import detect_topic_transitions
from backend.app.core.nlp.relevance import evaluate_response_relevance


@pytest.fixture(scope="module")
def embedding_engine():
    return EmbeddingEngine.get_instance()


def test_embeddings_and_coherence(embedding_engine):
    # Topically coherent consecutive sentences
    coherent_sentences = [
        "Distributed database replication improves data fault tolerance and system reliability.",
        "When a primary replica fails, consensus algorithms like Raft elect a new leader automatically.",
        "This ensures continuous availability without data corruption across the storage cluster."
    ]
    embeddings = embedding_engine.encode(coherent_sentences)
    assert embeddings.shape == (3, 384)

    coherence_res = compute_semantic_coherence(coherent_sentences, embeddings)
    # Consecutive sentences in distributed systems should exhibit high semantic similarity (> 0.5)
    assert coherence_res["mean_coherence"] > 0.30
    assert len(coherence_res["pairwise_coherence"]) == 2


def test_topic_transition_detection(embedding_engine):
    # Sentences with an abrupt topic shift between sentence 2 and 3
    divergent_sentences = [
        "In Kubernetes, horizontal pod autoscalers monitor CPU utilization metrics.",
        "They dynamically adjust replica counts based on the incoming traffic load.",
        "Chocolate chip cookies require high-quality butter and vanilla extract for optimal flavor.",
        "Bake the dough at three hundred and fifty degrees for eleven minutes until golden brown."
    ]
    embeddings = embedding_engine.encode(divergent_sentences)
    transitions = detect_topic_transitions(divergent_sentences, embeddings, threshold=0.35)

    # Expect a detected topic shift from Kubernetes to Cookie Baking
    assert len(transitions) >= 1
    shift = transitions[0]
    assert shift["from_sentence_index"] == 1
    assert shift["to_sentence_index"] == 2
    assert shift["drift_magnitude"] > 0.65


def test_response_relevance_and_rubric(embedding_engine):
    question = "How does database indexing with B-Trees optimize read query latency?"
    answer = [
        "B-Trees maintain sorted key-value pairs in balanced multi-way tree nodes.",
        "This reduces search time complexity from linear scan to logarithmic time.",
        "Disk I/O operations are minimized because each node matches page block sizes."
    ]
    expected_points = [
        "Logarithmic search time complexity O(log N)",
        "Balanced multi-way tree structure",
        "Reduction of disk block I/O operations"
    ]
    res = evaluate_response_relevance(
        question_text=question,
        answer_sentences=answer,
        expected_points=expected_points,
        embedding_engine=embedding_engine
    )

    assert res["overall_relevance_score"] > 0.50
    assert res["rubric_coverage_pct"] >= 66.0
    assert len(res["points_coverage"]) == 3
def test_single_sentence_has_insufficient_coherence_data(embedding_engine):
    sentences = [
        "Artificial intelligence can help students learn programming."
    ]

    embeddings = embedding_engine.encode(sentences)

    result = compute_semantic_coherence(sentences, embeddings)

    assert result["mean_coherence"] is None
    assert result["min_coherence"] is None
    assert result["pairwise_coherence"] == []
    assert result["insufficient_data"] is True