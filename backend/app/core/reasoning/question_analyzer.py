"""Local Question Analysis Engine for Arbitrary Interview Questions.

Performs offline, deterministic and embedding-backed question decomposition:
- Technical archetype / intent taxonomy classification
- Concept and keyphrase extraction (KeyBERT-style MMR using local all-MiniLM-L6-v2)
- Dynamic synthesis of expected answer areas and structured rubric criteria
- Ground-truth validation status and scientific caveat generation
"""

import re
from typing import List, Dict, Any, Optional, Set
import numpy as np
from backend.app.core.nlp.embeddings import EmbeddingEngine
from backend.app.utils.logger import logger

# Common English stop words for candidate filtering
STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than",
    "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
    "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
    "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what",
    "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd",
    "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
    # Common conversational question fillers
    "explain", "describe", "discuss", "tell", "give", "would", "please"
}


# Archetype anchor definitions
QUESTION_ARCHETYPES = {
    "system_design": {
        "title": "System Architecture & Distributed Systems",
        "patterns": [
            r"\bdesign\b", r"\barchitect\b", r"\bscale\b", r"\bscaling\b",
            r"\bdistributed\b", r"\brate limit\b", r"\bgateway\b", r"\bmicroservices?\b",
            r"\bthroughput\b", r"\bavailability\b", r"\bfault toleran", r"\bsharding\b",
            r"\breplication\b", r"\blatency\b", r"\bload balanc", r"\bqueue\b", r"\bcach(e|ing)\b"
        ],
        "anchor_text": "distributed system design architecture scalability fault tolerance throughput latency caching microservices",
        "default_criteria": [
            {"criterion": "Architectural Foundation", "description": "Explains core components, communication protocols, and topological structure."},
            {"criterion": "Scalability & Concurrency", "description": "Addresses high-throughput handling, state management, and race conditions."},
            {"criterion": "Resilience & Failure Modes", "description": "Analyzes failover mechanisms, latency bottlenecks, and error recovery."},
            {"criterion": "Trade-offs & Implementation", "description": "Justifies operational trade-offs, technology choices, and edge cases."}
        ]
    },
    "algorithmic": {
        "title": "Data Structures & Algorithms",
        "patterns": [
            r"\balgorithm\b", r"\bdata structures?\b", r"\btime complexity\b", r"\bspace complexity\b",
            r"\bo\(", r"\bbig o\b", r"\bbinary tree\b", r"\bgraph\b", r"\bdynamic programming\b",
            r"\bsort(ing)?\b", r"\bsearch(ing)?\b", r"\brecursion\b", r"\barray\b", r"\bheap\b"
        ],
        "anchor_text": "data structures algorithms time complexity space complexity big o runtime memory optimization binary trees",
        "default_criteria": [
            {"criterion": "Algorithmic Approach", "description": "Formulates efficient data structure selection and logical progression."},
            {"criterion": "Complexity Analysis", "description": "Accurately articulates asymptotic time and space bounds (Big-O)."},
            {"criterion": "Edge Cases & Invariants", "description": "Addresses boundary conditions, empty inputs, and corner cases."},
            {"criterion": "Optimization & Trade-offs", "description": "Examines alternative solutions and memory vs runtime efficiency."}
        ]
    },
    "comparative_tradeoff": {
        "title": "Comparative Analysis & Technical Trade-offs",
        "patterns": [
            r"\bvs\.?\b", r"\bversus\b", r"\bdifference between\b", r"\bcompare\b",
            r"\btrade-?offs?\b", r"\bwhen would you choose\b", r"\bpros and cons\b",
            r"\binstead of\b", r"\balternatives?\b", r"\bcontrast\b"
        ],
        "anchor_text": "comparing architectural approaches trade-offs differences advantages disadvantages performance characteristics",
        "default_criteria": [
            {"criterion": "Structural Differences", "description": "Clearly contrasts the underlying mechanisms and structural differences."},
            {"criterion": "Performance Trade-offs", "description": "Evaluates read/write, compute, or operational efficiency trade-offs."},
            {"criterion": "Selection Criteria & Use Cases", "description": "Defines scenarios where one approach strictly supersedes the other."},
            {"criterion": "Operational Complexity", "description": "Discusses maintenance, debugging, and migration considerations."}
        ]
    },
    "behavioral_leadership": {
        "title": "Behavioral & Engineering Leadership",
        "patterns": [
            r"\btell me about a time\b", r"\bdescribe a situation\b", r"\bgive an example\b",
            r"\bhow do you handle\b", r"\bconflict\b", r"\bdisagree(ment)?\b",
            r"\bleadership\b", r"\bfail(ed|ure)?\b", r"\bmistake\b", r"\bdeadline\b",
            r"\bprioritiz(e|ation)\b", r"\bcollaborat(e|ion)\b"
        ],
        "anchor_text": "behavioral leadership teamwork conflict resolution situational star method decision making accountability",
        "default_criteria": [
            {"criterion": "Situation & Context (STAR)", "description": "Articulates clear background, business stakes, and initial challenges."},
            {"criterion": "Action & Ownership", "description": "Demonstrates specific personal actions, problem-solving, and initiatives taken."},
            {"criterion": "Measurable Result", "description": "Communicates concrete, quantifiable outcomes and organizational impact."},
            {"criterion": "Reflection & Learning", "description": "Exhibits self-awareness, lessons learned, and systemic improvement."}
        ]
    },
    "debugging_troubleshooting": {
        "title": "System Troubleshooting & Root Cause Analysis",
        "patterns": [
            r"\bdebug(ging)?\b", r"\btroubleshoot(ing)?\b", r"\bincident\b", r"\boutage\b",
            r"\broot cause\b", r"\bbottleneck\b", r"\bmemory leak\b", r"\bcrash(ed)?\b",
            r"\bpost-?mortem\b", r"\bprofiling\b", r"\bobservability\b"
        ],
        "anchor_text": "system troubleshooting debugging root cause analysis telemetry observability incident response mitigation",
        "default_criteria": [
            {"criterion": "Triage & Observability", "description": "Identifies telemetry signals, metrics, logs, and initial impact scoping."},
            {"criterion": "Hypothesis & Isolation", "description": "Follows a structured hypothesis-driven approach to isolate the fault."},
            {"criterion": "Mitigation & Recovery", "description": "Executes rapid stabilization before deep remediation."},
            {"criterion": "Prevention & Post-Mortem", "description": "Institutes guardrails, regression tests, and systemic post-mortem fixes."}
        ]
    },
    "conceptual_deep_dive": {
        "title": "Technical Principles & Conceptual Deep Dive",
        "patterns": [
            r"\bhow does\b", r"\bwhat is\b", r"\bhow do\b", r"\bexplain the concept\b",
            r"\bunder the hood\b", r"\binternals?\b", r"\blifecycle\b", r"\bmechanism\b"
        ],
        "anchor_text": "technical concepts principles fundamental mechanism internal architecture execution lifecycle theory",
        "default_criteria": [
            {"criterion": "Conceptual Definition", "description": "Provides an accurate high-level definition and core problem statement."},
            {"criterion": "Internal Mechanism", "description": "Explains internal execution workflow, data flow, and runtime mechanics."},
            {"criterion": "Real-World Application", "description": "Grounds the concept with practical engineering use cases and caveats."},
            {"criterion": "Clarity & Organization", "description": "Structures the explanation with logical progression and clear signposting."}
        ]
    }
}


class QuestionAnalyzer:
    """Decomposes arbitrary interview questions locally into structured rubrics."""

    @classmethod
    def extract_candidates(cls, text: str, min_n: int = 1, max_n: int = 3) -> List[str]:
        """Extracts n-gram keyphrase candidates filtering out punctuation and stop words."""
        # Clean text
        clean = re.sub(r"[^\w\s-]", " ", text.lower())
        words = [w.strip() for w in clean.split() if w.strip()]

        candidates: Set[str] = set()
        n_words = len(words)

        for n in range(min_n, max_n + 1):
            for i in range(n_words - n + 1):
                ngram_tokens = words[i:i + n]
                # Filter if all tokens are stop words or tokens are too short
                if all(t in STOP_WORDS for t in ngram_tokens):
                    continue
                if ngram_tokens[0] in STOP_WORDS or ngram_tokens[-1] in STOP_WORDS:
                    continue
                if any(len(t) < 2 for t in ngram_tokens):
                    continue
                phrase = " ".join(ngram_tokens)
                if len(phrase) >= 3:
                    candidates.add(phrase)

        # Fallback if no n-grams passed filters
        if not candidates:
            candidates = {w for w in words if len(w) >= 3 and w not in STOP_WORDS}

        return list(candidates)

    @classmethod
    def extract_concepts_mmr(
        cls,
        question_text: str,
        embedding_engine: Optional[EmbeddingEngine] = None,
        top_k: int = 4,
        diversity_lambda: float = 0.65
    ) -> List[str]:
        """Extracts major technical concepts using local KeyBERT-style MMR via all-MiniLM-L6-v2."""
        engine = embedding_engine or EmbeddingEngine.get_instance()
        candidates = cls.extract_candidates(question_text)

        if not candidates:
            return [question_text[:50]]

        # Encode question and candidates
        q_emb = engine.encode(question_text)  # (1, 384)
        cand_embs = engine.encode(candidates)  # (N, 384)

        if cand_embs.shape[0] == 0:
            return candidates[:top_k]

        # Calculate similarity between candidates and question: (N,)
        doc_sims = np.dot(cand_embs, q_emb.T).flatten()

        # Calculate candidate-to-candidate similarity matrix: (N, N)
        cand_sims = np.dot(cand_embs, cand_embs.T)

        selected_indices: List[int] = []
        candidate_indices = list(range(len(candidates)))

        # Step 1: Pick candidate with highest similarity to the question
        first_idx = int(np.argmax(doc_sims))
        selected_indices.append(first_idx)
        candidate_indices.remove(first_idx)

        # Step 2: Iteratively select candidates balancing relevance and diversity (MMR)
        while len(selected_indices) < min(top_k, len(candidates)):
            best_idx = None
            best_score = -float("inf")

            for idx in candidate_indices:
                relevance = doc_sims[idx]
                max_cand_sim = max(cand_sims[idx, prev_idx] for prev_idx in selected_indices)
                mmr_score = (diversity_lambda * relevance) - ((1.0 - diversity_lambda) * max_cand_sim)

                if mmr_score > best_score:
                    best_score = mmr_score
                    best_idx = idx

            if best_idx is not None:
                selected_indices.append(best_idx)
                candidate_indices.remove(best_idx)
            else:
                break

        return [candidates[i] for i in selected_indices]

    @classmethod
    def classify_question_type(
        cls,
        question_text: str,
        embedding_engine: Optional[EmbeddingEngine] = None
    ) -> Dict[str, Any]:
        """Classifies interview question into archetype using regex patterns + zero-shot embedding fallback."""
        lower_q = question_text.lower()

        # Phase 1: Pattern matching count
        matched_scores: Dict[str, int] = {}
        for arch_key, arch_meta in QUESTION_ARCHETYPES.items():
            score = 0
            for pat in arch_meta["patterns"]:
                if re.search(pat, lower_q):
                    score += 1
            matched_scores[arch_key] = score

        best_arch, best_score = max(matched_scores.items(), key=lambda x: x[1])

        # If pattern matching has clear winner (>= 1 match)
        if best_score > 0:
            return {
                "key": best_arch,
                "title": QUESTION_ARCHETYPES[best_arch]["title"],
                "confidence": min(1.0, 0.6 + (0.15 * best_score)),
                "method": "rule_pattern"
            }

        # Phase 2: Embedding zero-shot similarity fallback
        engine = embedding_engine or EmbeddingEngine.get_instance()
        q_emb = engine.encode(question_text)  # (1, 384)

        arch_keys = list(QUESTION_ARCHETYPES.keys())
        anchor_texts = [QUESTION_ARCHETYPES[k]["anchor_text"] for k in arch_keys]
        anchor_embs = engine.encode(anchor_texts)  # (6, 384)

        sims = np.dot(anchor_embs, q_emb.T).flatten()
        best_sim_idx = int(np.argmax(sims))
        chosen_key = arch_keys[best_sim_idx]

        return {
            "key": chosen_key,
            "title": QUESTION_ARCHETYPES[chosen_key]["title"],
            "confidence": round(float(sims[best_sim_idx]), 3),
            "method": "embedding_zero_shot"
        }

    @classmethod
    def synthesize_expected_answer_areas(
        cls,
        question_type: str,
        major_concepts: List[str],
        question_text: str
    ) -> List[str]:
        """Synthesizes context-aware expected answer areas incorporating major concepts."""
        primary_concept = major_concepts[0] if major_concepts else "core subject"
        secondary_concept = major_concepts[1] if len(major_concepts) > 1 else "key components"
        tertiary_concept = major_concepts[2] if len(major_concepts) > 2 else "operational trade-offs"

        if question_type == "system_design":
            return [
                f"High-level architecture and fundamental role of {primary_concept}",
                f"Data flow, protocol boundaries, and scaling dynamics involving {secondary_concept}",
                f"Resilience, failure recovery modes, and state consistency under load",
                f"Trade-offs regarding latency, partition tolerance, and {tertiary_concept}"
            ]
        elif question_type == "comparative_tradeoff":
            return [
                f"Structural and architectural distinction between {primary_concept} and {secondary_concept}",
                f"Read/write, compute, or disk access trade-offs under real workloads",
                f"Compaction, synchronization overhead, or operational failure modes",
                f"Concrete production use cases where one approach is favored over the other"
            ]
        elif question_type == "algorithmic":
            return [
                f"Algorithmic design and data structure choice for {primary_concept}",
                f"Asymptotic time and space complexity bounds (Big-O analysis)",
                f"Edge case handling, termination conditions, and boundary invariants",
                f"Practical optimization strategies regarding memory and execution overhead"
            ]
        elif question_type == "behavioral_leadership":
            return [
                f"Situation and background context involving {primary_concept}",
                f"Specific tactical actions, ownership, and stakeholder collaboration",
                f"Resolution of obstacles, disagreements, or delivery constraints",
                f"Quantifiable results, project impact, and engineering takeaways"
            ]
        elif question_type == "debugging_troubleshooting":
            return [
                f"Initial telemetry triage, alerting signals, and symptom scoping for {primary_concept}",
                f"Hypothesis formulation and isolation of root-cause bottlenecks",
                f"Remediation actions taken to stabilize active traffic or memory load",
                f"Long-term preventive measures, regression tests, and post-mortem review"
            ]
        else:  # conceptual_deep_dive
            return [
                f"Accurate foundational definition and core principle of {primary_concept}",
                f"Internal execution mechanism, control flow, and interaction with {secondary_concept}",
                f"Practical implementation considerations and performance bottlenecks",
                f"Engineering constraints, edge cases, and real-world trade-offs"
            ]

    @classmethod
    def analyze_question(
        cls,
        question_text: str,
        category_hint: Optional[str] = None,
        embedding_engine: Optional[EmbeddingEngine] = None
    ) -> Dict[str, Any]:
        """Complete analysis pipeline for arbitrary interview questions.
        
        Outputs:
            - question_type (key, title, confidence)
            - major_concepts (KeyBERT + MMR)
            - expected_points (synthesized contextual expected answer areas)
            - rubric_criteria (criteria with descriptions)
            - scientific_status (unverified disclaimer for arbitrary prompts)
        """
        text = question_text.strip()
        if len(text) < 5:
            raise ValueError("Question prompt must contain at least 5 characters.")

        engine = embedding_engine or EmbeddingEngine.get_instance()

        # 1. Classify type
        type_info = cls.classify_question_type(text, embedding_engine=engine)
        arch_meta = QUESTION_ARCHETYPES.get(type_info["key"], QUESTION_ARCHETYPES["conceptual_deep_dive"])

        # 2. Extract major concepts via KeyBERT + MMR
        major_concepts = cls.extract_concepts_mmr(text, embedding_engine=engine, top_k=4)

        # 3. Synthesize expected answer points
        expected_points = cls.synthesize_expected_answer_areas(
            question_type=type_info["key"],
            major_concepts=major_concepts,
            question_text=text
        )

        # 4. Generate rubric criteria
        rubric_criteria = arch_meta["default_criteria"]

        # 5. Extract a concise title if none given
        words = text.split()
        title = " ".join(words[:7]) + ("..." if len(words) > 7 else "")

        return {
            "id": f"custom-{abs(hash(text)) % 1000000:06d}",
            "is_custom": True,
            "title": title,
            "prompt": text,
            "category": category_hint or type_info["title"],
            "difficulty": "advanced" if len(words) > 15 else "intermediate",
            "question_type": type_info["key"],
            "question_type_label": type_info["title"],
            "classification_method": type_info["method"],
            "classification_confidence": type_info["confidence"],
            "major_concepts": major_concepts,
            "expected_points": expected_points,
            "rubric_criteria": rubric_criteria,
            "has_ground_truth": False,
            "technical_correctness_status": "unverified",
            "technical_correctness_disclaimer": (
                "Semantic coverage verifies topical relevance and conceptual alignment, "
                "but cannot verify mathematical, algorithmic, or factual correctness without "
                "a verified reference solution."
            )
        }
