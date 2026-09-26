# VOXIQ ? Engineering Interview Defense Manual

This document provides rigorous, defensible answers to the 10 core architectural and engineering questions for technical interview reviews.

---

### 1. What exactly did you build?
VOXIQ is a Real-Time Multimodal Communication Intelligence Platform. It ingests speech audio, performs 16kHz mono normalization and Voice Activity Detection (VAD), runs word-level timestamped speech-to-text, extracts Layer 1 deterministic acoustic/linguistic metrics (active WPM, pause intervals, filler density, lexical repetition, sentence complexity), models Layer 2 semantic coherence and topic transitions using sentence embeddings, and generates Layer 3 evidence-anchored recommendations strictly tied to timestamps.

### 2. Why did you architect the system with three distinct analytical layers?
To ensure **scientific defensibility and zero metric hallucination**:
* If an LLM calculates WPM or counts pauses, it hallucinates.
* Layer 1 relies strictly on deterministic signal processing and discrete token math.
* Layer 2 uses established NLP embedding models (`all-MiniLM-L6-v2`) for continuous semantic similarity.
* Layer 3 uses reasoning solely to explain the evidence compiled by Layers 1 and 2.

### 3. What algorithms and models did you use?
* **Audio Preprocessing**: Rational polyphase resampling (`scipy.signal.resample_poly`) to 16,000 Hz, RMS loudness normalization targeting -20 dBFS with peak limiting at 0.95.
* **VAD**: Short-time log frame energy ($E = 10 \\log_{10}(\\sum x^2 + \\epsilon)$) with adaptive 20th-percentile ambient noise floor estimation and 150ms hangover smoothing.
* **Speech-to-Text**: Faster-Whisper (`base.en` with CTranslate2 runtime, 8-bit quantized CPU execution or float16 on CUDA) with word-level timestamps.
* **Semantic Analysis**: Sentence-Transformers (`all-MiniLM-L6-v2`, 384-dim dense vectors, normalized dot product).
* **Temporal Analysis**: 30-second sliding windows with 15-second steps for temporal acceleration detection.

### 4. What alternatives did you consider?
* **Raw Whisper vs Faster-Whisper**: Faster-Whisper was selected because CTranslate2 provides up to 4x faster inference with 50% less RAM utilization on CPU/GPU without loss of accuracy.
* **Cloud Speech APIs vs Local Engine**: Local models prevent data egress, protect user voice privacy, and eliminate third-party API metering costs.
* **Single Communication Score vs Dimensional Profile**: A single aggregate 'score' is scientifically fraudulent because communication goals vary (e.g. a technical system design interview requires different cadence than an inspirational keynote). VOXIQ provides raw dimensions plus contextual baselines.

### 5. What data did you use for validation?
* Synthetic acoustic test signals with calibrated sine bursts and precise silence intervals (validating VAD pause duration to within 0.05s).
* Topically clustered technical transcripts vs divergent conversational corpora (validating semantic coherence and topic drift thresholds).
* Word token sequences with controlled filler density and n-gram repetitions (validating 100% mathematical precision in unit tests).

### 6. How does real-time streaming work?
VOXIQ implements a dedicated WebSocket endpoint (`/ws/audio/{session_id}`). Audio is captured in the browser via Web Audio API, downmixed and chunked, and streamed over WebSocket. The backend maintains an incremental audio buffer, performing live frame energy estimation and broadcasting telemetry (current state: speaking vs pause, pause duration, accumulated active speech) back to the client every 1.0 second.

### 7. How did you handle user privacy and sensitive audio data?
* Configurable raw audio retention (`AUDIO_RETENTION_MINUTES = 60`).
* Automatic background purging of raw audio assets while retaining derived mathematical metrics.
* Zero external transmission of raw voice recordings.
* Database models separate session metadata from audio storage assets, allowing audio deletion without destroying historical analytics.

### 8. How does the system handle failure and graceful degradation?
* If the LLM provider fails or API keys are omitted, the system falls back seamlessly to deterministic rule-based evidence synthesis. All Layer 1 and Layer 2 metrics render with zero disruption.
* If audio contains silence or background noise, VAD flags empty speech intervals gracefully without crashing.
* If GPU/CUDA is unavailable, Whisper and Sentence-Transformers automatically fall back to CPU int8 execution.

### 9. How does the system scale?
* Stateless FastAPI application layer capable of running across multiple horizontal container replicas.
* Audio processing tasks can be offloaded to Celery/Redis background worker pools as traffic grows.
* Database schema is fully normalized and indexed on `session_id`, `window_start`, and timestamps for sub-millisecond retrieval.

### 10. What are the platform's scientific boundaries and limitations?
VOXIQ explicitly disclaims any ability to measure psychological traits, confidence, mental states, or truthfulness. All metrics describe observable acoustic dynamics (pacing, hesitation, pauses) or linguistic properties (coherence, repetition, vocabulary breadth).
