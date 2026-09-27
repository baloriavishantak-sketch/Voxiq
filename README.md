# YUKTI — Real-Time Multimodal Communication Intelligence Platform

<p align="center">
  <img src="./frontend/public/yukti.png" width="550" alt="YUKTI Logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-blue">
  <img src="https://img.shields.io/badge/Next.js-14-black">
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688">
  <img src="https://img.shields.io/badge/PyTorch-ML-red">
  <img src="https://img.shields.io/badge/Tests-21%20Passed-success">
  <img src="https://img.shields.io/badge/License-MIT-green">
</p>


## Overview

YUKTI is a production-grade multimodal communication intelligence platform that analyzes **how a person communicates**, not just what they say.

The system combines:

**Audio Processing + Voice Activity Detection + Faster-Whisper Speech Recognition + Deterministic Communication Metrics + NLP Semantic Analysis + Evidence-Based Feedback + Real-Time Analytics**

YUKTI transforms spoken conversations into measurable communication insights through a layered AI pipeline.

---

# Scientific Approach

> [!IMPORTANT]
> YUKTI focuses only on measurable communication signals. It does not claim to detect intelligence, personality, confidence, mental state, or truthfulness from voice.

The platform analyzes scientifically observable characteristics:

- Speech fluency
- Speaking rate
- Pause patterns
- Filler-word usage
- Lexical repetition
- Sentence structure
- Semantic coherence
- Response organization
- Communication trends over time

---

# System Architecture

```
                     USER AUDIO
                         |
                         |
                  Audio Capture
                         |
                         |
              Audio Preprocessing
                         |
        --------------------------------
        |                              |
        ▼                              ▼
 Voice Activity Detection        Signal Analysis
        |
        |
        ▼
 Faster-Whisper Speech Recognition
        |
        |
        ▼
 Word Level Transcript
        |
        |
 =========================================
              YUKTI AI ENGINE
 =========================================

        Layer 1
 Deterministic Communication Metrics

        |
        |
        ▼

        Layer 2
 Semantic NLP Intelligence

        |
        |
        ▼

        Layer 3
 Evidence-Based Reasoning

        |
        |
        ▼

 Communication Intelligence Dashboard
```

---

# Three Layer Intelligence Engine

## Layer 1 — Deterministic Communication Engine

Directly calculated communication measurements.

| Metric | Description |
|---|---|
| Speaking Rate | Words per minute analysis |
| Pause Detection | Acoustic silence measurement |
| Filler Density | Detection of hesitation words |
| Lexical Repetition | Repeated phrase analysis |
| Type Token Ratio | Vocabulary diversity |
| Sentence Statistics | Length and complexity |
| Temporal Analysis | Communication changes over time |

---

## Layer 2 — Semantic NLP Intelligence

Powered by local embedding models.

Model:

```
sentence-transformers/all-MiniLM-L6-v2
```

Capabilities:

- Sentence embeddings
- Semantic similarity
- Response relevance
- Topic transition detection
- Semantic coherence analysis
- Concept coverage analysis

---

## Layer 3 — Evidence Based Reasoning

The reasoning layer converts measured signals into structured feedback.

Every recommendation is linked with:

- Transcript evidence
- Timestamp information
- Communication metrics
- Semantic patterns

Example:

```
Speaking rate increased from 140 WPM
to 165 WPM during the final section.
```

---

# Interview Intelligence Mode

YUKTI includes an advanced interview analysis environment.

Unlike fixed question systems, users can enter:

```
Any technical or behavioral question
```

Example:

```
How does garbage collection work in Java?
```

The system automatically:

- Classifies question type
- Extracts important concepts
- Generates expected answer areas
- Builds evaluation criteria
- Analyses spoken response


## Supported Question Types

- System Design
- Data Structures & Algorithms
- Software Architecture
- Programming Concepts
- Technical Explanation
- Trade-off Analysis
- Behavioral Questions


## Interview Evaluation

The response is analyzed through:

| Category | Analysis |
|-|-|
| Delivery | Speaking rate, fillers, pauses |
| Structure | Introduction, progression, conclusion |
| Semantics | Relevance and concept coverage |
| Communication | Clarity and organization |


---

# Feature Status

| Feature | Category | Status |
|-|-|-|
| Audio preprocessing | Audio Engine | ✅ IMPLEMENTED |
| 16kHz resampling | Audio Engine | ✅ IMPLEMENTED |
| RMS normalization | Audio Engine | ✅ IMPLEMENTED |
| Voice Activity Detection | Audio Engine | ✅ IMPLEMENTED |
| Pause detection | Audio Engine | ✅ IMPLEMENTED |
| Faster-Whisper STT | Speech Engine | ✅ IMPLEMENTED |
| Word timestamps | Speech Engine | ✅ IMPLEMENTED |
| Speaking rate analysis | Layer 1 | ✅ IMPLEMENTED |
| Filler detection | Layer 1 | ✅ IMPLEMENTED |
| Lexical repetition | Layer 1 | ✅ IMPLEMENTED |
| Vocabulary analysis | Layer 1 | ✅ IMPLEMENTED |
| Temporal communication timeline | Layer 1 | ✅ IMPLEMENTED |
| Sentence embeddings | Layer 2 | ✅ IMPLEMENTED |
| Semantic coherence | Layer 2 | ✅ IMPLEMENTED |
| Topic transition analysis | Layer 2 | ✅ IMPLEMENTED |
| Question intelligence | Interview AI | ✅ IMPLEMENTED |
| Custom interview questions | Interview AI | ✅ IMPLEMENTED |
| Evidence-linked feedback | Layer 3 | ✅ IMPLEMENTED |
| Session history | Analytics | ✅ IMPLEMENTED |
| Longitudinal analytics | Analytics | ✅ IMPLEMENTED |
| Multi-speaker analysis | Future | 🔮 PLANNED |

---

# Technology Stack

## Frontend

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Recharts
- Web Audio API


## Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- PostgreSQL Compatible


## AI / ML

- PyTorch
- Faster-Whisper
- Sentence Transformers
- NumPy
- SciPy


---

# Project Structure

```
YUKTI/

├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── database/
│   |
│   └── tests/

├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/

├── docs/

├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# Installation

## Requirements

- Python 3.11+
- Node.js 18+
- npm
- Git


## Backend Setup

```bash
cd backend

pip install -r requirements.txt
```

Run tests:

```bash
pytest tests/ -v
```

Start backend:

```bash
uvicorn backend.app.main:app --reload
```


API Documentation:

```
http://localhost:8000/docs
```


---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```


Open:

```
http://localhost:3000
```

---

# Testing

Backend:

```
21 tests passed
```

Coverage includes:

- API pipeline
- Audio processing
- VAD detection
- Metric calculations
- NLP coherence
- Topic analysis
- Interview evaluation
- Question intelligence


Frontend:

```
Next.js Production Build
✓ Passed
✓ TypeScript Validation
✓ Static Generation
```

---

# Dashboard Modules

## Communication Dashboard

Provides:

- Real-time metrics
- Speech analytics
- Communication overview


## Recording Studio

Includes:

- Audio recording
- Processing pipeline
- Live telemetry


## Interview Cockpit

Includes:

- Custom questions
- AI question analysis
- Response evaluation
- Communication feedback


## Analytics Suite

Tracks:

- Speaking trends
- Filler trends
- Semantic trends
- Personal baselines


---

# Privacy First Architecture

YUKTI follows a local-first AI approach.

Core processing can run without external AI APIs.

No external services are required for:

- Speech analysis
- Semantic embeddings
- Communication metrics


---

# Roadmap

## Completed

✅ Speech Recognition  
✅ Audio Intelligence  
✅ NLP Analysis  
✅ Interview Intelligence  
✅ Analytics Dashboard  
✅ Evidence-Based Feedback  


## Future

🔮 Multi-speaker conversations  
🔮 Speaker diarization  
🔮 Multilingual support  
🔮 Real-time collaborative interviews  
🔮 Advanced communication coaching  


---

# License

MIT License

---

<p align="center">

## YUKTI

### Conversations to Insights

Built with AI, Speech Processing and Human-Centered Intelligence.

</p>
