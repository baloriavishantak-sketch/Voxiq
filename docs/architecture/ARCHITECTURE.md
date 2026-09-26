# VOXIQ ? System Architecture & Technical Specifications

## 1. High-Level Architectural Flow

```
Browser Microphone (Web Audio API)
       ?
       ? [16-bit PCM WAV / WebSocket]
Audio Ingestion & Preprocessing (16kHz Mono, RMS Normalization)
       ?
       ?
Voice Activity Detection (Adaptive Energy, ZCR & Spectral Flux)
       ??? Speech Intervals & Active Duration
       ??? Acoustic Pauses (>0.5s & >1.2s)
       ?
       ?
Speech-to-Text Engine (Faster-Whisper int8 / CUDA)
       ??? Word-level Timestamps & Confidence
       ??? Sentence Boundary Segmentation
       ?
       ?
Three-Layer Analytical Pipeline
   ??? Layer 1: Deterministic Engine (Active WPM, Filler Density, Repetition, Complexity)
   ??? Layer 2: ML & Semantic NLP (Sentence-Transformers, Coherence, Topic Transitions)
   ??? Layer 3: Evidence-Linked Reasoning (Timestamped Feedback, Rubric Evaluation)
       ?
       ?
Persistence Layer (SQLAlchemy 2.0 Async ? SQLite / PostgreSQL)
       ?
       ?
REST & WebSocket API (FastAPI) ???? Next.js Dashboard & Visualization
```

## 2. Multi-Layer Analytical Decoupling

VOXIQ enforces a strict architectural boundary between deterministic calculations, machine learning representations, and high-level reasoning.

| Layer | Responsibility | Technology | Guarantees |
|---|---|---|---|
| **Layer 1: Deterministic** | Exact physical and mathematical metrics (WPM, pause intervals, filler counts, n-gram repetitions, sentence lengths) | NumPy, SciPy | 0% hallucination risk; 100% reproducible; unit-tested formulas. |
| **Layer 2: ML & Semantic NLP** | Continuous semantic representations, coherence drift, topic transition clustering, question relevance | Sentence-Transformers (`all-MiniLM-L6-v2`), PyTorch | 384-dimensional dense vectors, normalized cosine similarity, calibrated thresholds. |
| **Layer 3: Evidence Reasoning** | Actionable feedback synthesis, rubric scoring, session summaries | Structured Reasoning Engine (with optional Gemini / OpenAI provider) | Strictly consumes Layer 1 & 2 structured evidence packets; all claims anchored to timestamps. |

## 3. Storage Schema & Versioning

All metrics stored in `communication_metrics` carry a `calculation_version` tag (e.g. `1.0.0`). This guarantees that future improvements to algorithms (e.g. enhanced VAD models or newer sentence embeddings) do not corrupt historical comparability or longitudinal trend validity.
