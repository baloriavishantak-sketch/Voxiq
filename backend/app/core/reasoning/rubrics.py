"""Interview Question Bank and Structured Evaluation Rubrics."""

from typing import List, Dict, Any, Optional

DEFAULT_INTERVIEW_QUESTIONS: List[Dict[str, Any]] = [
    {
        "id": "q-sys-01",
        "category": "System Design",
        "title": "Design a Distributed Rate Limiter",
        "prompt": "How would you design a distributed rate limiter that handles tens of thousands of requests per second across multiple regional gateway nodes?",
        "difficulty": "advanced",
        "expected_points": [
            "Token Bucket or Leaky Bucket algorithm",
            "Centralized in-memory store like Redis with Lua scripts for atomicity",
            "Sliding window counter vs fixed window trade-offs",
            "Handling race conditions, network latency, and fallback when Redis is unreachable",
            "Local in-memory batching or token synchronization"
        ],
        "rubric_criteria": [
            {"criterion": "Algorithm Selection", "description": "Explains sliding window or token bucket mechanism"},
            {"criterion": "Distributed State & Concurrency", "description": "Addresses race conditions, atomicity, or shared storage"},
            {"criterion": "Failure Modes & Latency", "description": "Discusses Redis failure fallback and gateway latency"}
        ]
    },
    {
        "id": "q-algo-02",
        "category": "Data Structures & Algorithms",
        "title": "Explain B-Trees vs LSM-Trees for Database Storage",
        "prompt": "Explain the architectural differences, read-write trade-offs, and disk access patterns between B-Trees and Log-Structured Merge (LSM) Trees in modern database storage engines.",
        "difficulty": "advanced",
        "expected_points": [
            "B-Trees optimize for random reads with in-place page updates",
            "LSM-Trees optimize for high write throughput via append-only commit logs and MemTables",
            "Compaction overhead and write amplification in LSM-Trees",
            "Disk block I/O alignment and logarithmic depth"
        ],
        "rubric_criteria": [
            {"criterion": "Structural Mechanism", "description": "Contrasts in-place node modification with append-only immutable SSTables"},
            {"criterion": "Read/Write Performance", "description": "Analyzes write amplification vs read amplification"},
            {"criterion": "Compaction Dynamics", "description": "Explains background compaction and garbage collection"}
        ]
    },
    {
        "id": "q-arch-03",
        "category": "Software Architecture",
        "title": "Event-Driven vs Synchronous REST Microservices",
        "prompt": "When would you architect a service using asynchronous event-driven messaging instead of synchronous HTTP/REST APIs? Discuss failure coupling and consistency.",
        "difficulty": "intermediate",
        "expected_points": [
            "Decoupling of producer and consumer availability",
            "Eventual consistency vs strong ACID consistency",
            "Backpressure handling and buffer queues during traffic spikes",
            "Dead-letter queues and idempotency mechanisms"
        ],
        "rubric_criteria": [
            {"criterion": "Coupling & Availability", "description": "Explains temporal and operational decoupling"},
            {"criterion": "Consistency Guarantees", "description": "Evaluates eventual consistency and idempotency"},
            {"criterion": "Operational Complexity", "description": "Considers message ordering, retries, and debugging"}
        ]
    }
]


def get_interview_question_by_id(question_id: str) -> Optional[Dict[str, Any]]:
    for q in DEFAULT_INTERVIEW_QUESTIONS:
        if q["id"] == question_id:
            return q
    return None
