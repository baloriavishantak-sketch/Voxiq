# VOXIQ ? Real-Time Multimodal Communication Intelligence Platform

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![Tests](https://img.shields.io/badge/pytest-16%20passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

VOXIQ is a production-grade, scientifically defensible platform that analyzes how a person communicates during spoken practice and technical interviews. It goes significantly beyond speech-to-text by combining:

**Audio Processing + Acoustic VAD + Faster-Whisper STT + Layer 1 Deterministic Metrics + Layer 2 ML/NLP + Layer 3 Evidence-Linked Reasoning + Real-Time Telemetry**

---

## ?? Scientific Integrity & Boundary Enforcement

> [!IMPORTANT]
> **Defensible Science Policy**: VOXIQ strictly **does NOT** claim to detect confidence, intelligence, mental state, personality, or truthfulness from voice. All outputs are strictly bounded under scientifically verifiable dimensions: *speech fluency*, *pacing dynamics*, *hesitation distributions*, *lexical repetition*, *sentence complexity*, and *semantic coherence*.

---

## ??? The Three Analytical Layers

```
Layer 1: Deterministic Engine (Zero LLM Dependency)
??? Active Speaking Rate (WPM): total_words / (active_speech_seconds / 60)
??? Acoustic Pauses (>0.5s) & Long Pauses (>1.2s)
??? Filler Word Density: (filler_count / total_words) * 100
??? Lexical n-gram Repetition & Type-Token Ratio (TTR)
??? 30-Second Sliding Windows for Temporal Acceleration Detection

Layer 2: ML & Semantic NLP (Representation Models)
??? 384-dimensional Dense Embeddings (Sentence-Transformers all-MiniLM-L6-v2)
??? Contiguous Sentence Semantic Coherence (Pairwise Cosine Similarity)
??? Topic Boundary Segmentation & Drift Magnitude
??? Question-to-Answer Semantic Relevance & Rubric Coverage

Layer 3: Evidence-Linked Reasoning (Synthesizer & Interview Evaluator)
??? Structured Evidence Assembly (Zero Raw Audio/Transcript sent directly for judgment)
??? Exact Acoustic Timestamp Anchoring (e.g. "Speaking rate increased from 135 to 165 WPM")
??? Rubric-based Interview Scoring (System Design, Algorithms, Architecture)
??? Graceful Offline Degradation when LLM keys are absent
```

---

## ?? Feature Status

| Feature | Category | Status | Notes |
|---|---|---|---|
| 16kHz Rational Polyphase Resampling | Audio Engine | **IMPLEMENTED** | High-fidelity downmixing & RMS normalization |
| Adaptive Log-Energy VAD & Pause Detection | Audio Engine | **IMPLEMENTED** | Configurable thresholds (0.5s / 1.2s) with hangover |
| Faster-Whisper Word Timestamp STT | Speech Engine | **IMPLEMENTED** | CTranslate2 int8/CUDA word token alignment |
| Active WPM & Gross WPM | Layer 1 | **IMPLEMENTED** | Speech duration vs session duration separation |
| Filler Word Lexicon & Density | Layer 1 | **IMPLEMENTED** | Single & multi-word phrase matching ('you know', 'sort of') |
| Lexical n-gram Repetition & TTR | Layer 1 | **IMPLEMENTED** | 1-gram to 3-gram repetition + Root TTR |
| Temporal Sliding Window Timeline | Layer 1 | **IMPLEMENTED** | 30s windows with 15s step; detects acceleration |
| Sentence-Transformers Embeddings | Layer 2 | **IMPLEMENTED** | `all-MiniLM-L6-v2` dense vectors |
| Contiguous Semantic Coherence | Layer 2 | **IMPLEMENTED** | Pairwise adjacent cosine similarity tracking |
| Topic Segmentation & Drift Detection | Layer 2 | **IMPLEMENTED** | Valley threshold detection in adjacent similarity |
| Evidence-Anchored Feedback Synthesis | Layer 3 | **IMPLEMENTED** | All recommendations linked to timestamps |
| Interview Mode & Rubric Evaluator | Layer 3 | **IMPLEMENTED** | Evaluates System Design, Algorithms, and Architecture |
| Real-Time WebSocket Streaming | Real-time | **IMPLEMENTED** | Incremental 16-bit PCM streaming & live VAD telemetry |
| Longitudinal Analytics & Personal Baseline | Analytics | **IMPLEMENTED** | Rolling WPM, filler trend, and pause averages |
| Next.js App Router & Tailwind Dashboard | Frontend | **IMPLEMENTED** | Recharts pacing timeline, recorder, and transcript |
| Multi-Speaker Diarization | Conversation | **FUTURE** | Planned for conversation mode |

---

## ?? Quickstart & Local Setup

### Prerequisites
* Python 3.11+ (Python 3.14 compatible)
* Node.js 18+ and npm
* Git

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/ -v
```

To run the backend server:
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Swagger API docs will be live at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Docker Deployment
```bash
docker-compose up --build
```

---

## ?? Comprehensive Test Suite

All 16 unit and integration tests run in under 20 seconds:
```bash
pytest backend/tests/ -v
```

* `test_health_and_sessions.py`: API health and Session CRUD lifecycle
* `test_audio_vad.py`: 16kHz resampling, RMS normalization, synthetic VAD pause detection
* `test_metrics_deterministic.py`: WPM formulas, pause distributions, filler density, repetition, temporal windows
* `test_nlp_coherence.py`: Dense embeddings, adjacent coherence, topic transition drift, rubric relevance
* `test_reasoning.py`: Evidence-anchored feedback generation, interview rubric evaluation
* `test_api_pipeline.py`: Full end-to-end integration test (Audio upload -> VAD -> STT -> Metrics -> DB -> REST response)

---

## ?? Technical Defense & Architecture Documentation
* [Architecture Specifications](docs/architecture/ARCHITECTURE.md)
* [Metrics Taxonomy & Scientific Formulas](docs/architecture/METRICS_TAXONOMY.md)
* [10-Question Interview Defense Guide](docs/defense/INTERVIEW_DEFENSE.md)
* [Speech Datasets Research](docs/research/DATASETS.md)
* [Third-Party Open Source Licenses](docs/licenses/THIRD_PARTY_LICENSES.md)

---

## ?? License
MIT License. Copyright (c) 2026 VOXIQ Contributors.
