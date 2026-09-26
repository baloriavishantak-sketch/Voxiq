"""Session Audio Analysis and Metric Extraction Endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.session import SessionModel, AudioAsset
from backend.app.models.transcript import TranscriptSegment, WordToken
from backend.app.models.metric import CommunicationMetric
from backend.app.models.semantic import SemanticSegment, TopicTransition
from backend.app.models.feedback import FeedbackItem
from backend.app.schemas.metric import SummaryMetricsResponse, TimelineResponse, TimelineWindowPoint
from backend.app.schemas.transcript import FullTranscriptResponse, TranscriptSegmentResponse, WordTokenResponse
from backend.app.core.audio.preprocessor import AudioPreprocessor
from backend.app.core.audio.vad import VoiceActivityDetector
from backend.app.core.audio.stt import SpeechToTextEngine
from backend.app.core.metrics import (
    calculate_wpm,
    analyze_pauses,
    detect_fillers,
    analyze_repetition_and_diversity,
    analyze_sentence_complexity,
    generate_temporal_timeline,
)
from backend.app.core.nlp import (
    EmbeddingEngine,
    compute_semantic_coherence,
    detect_topic_transitions,
)
from backend.app.core.reasoning.synthesizer import FeedbackSynthesizer
from backend.app.utils.logger import logger

router = APIRouter(prefix="/sessions", tags=["Analysis"])


@router.post("/{session_id}/analyze")
async def analyze_session_audio(
    session_id: str,
    file: Optional[UploadFile] = File(None),
    question_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """Processes uploaded audio through the complete 3-layer analytical pipeline.
    
    Pipeline:
        1. Ingest audio, downmix, resample to 16kHz, RMS normalize.
        2. Acoustic VAD segmentation (speech vs pause intervals).
        3. Word-level timestamped speech-to-text.
        4. Layer 1 Deterministic metrics (WPM, pause stats, filler density, repetition, temporal windows).
        5. Layer 2 ML/NLP (sentence embeddings, adjacent coherence, topic drift).
        6. Layer 3 Evidence-anchored reasoning synthesis.
        7. Persist metrics, segments, tokens, and feedback.
    """
    # 1. Fetch Session
    result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")

    if not file:
        raise HTTPException(status_code=400, detail="Audio file must be uploaded for analysis.")

    session.status = "processing"
    await db.commit()

    try:
        # Read uploaded bytes
        audio_bytes = await file.read()
        if len(audio_bytes) == 0:
            raise ValueError("Uploaded audio file is empty.")

        # Save raw audio asset
        asset_id = str(uuid.uuid4())
        audio_filename = f"{session_id}_{asset_id}.wav"
        save_path = settings.AUDIO_UPLOAD_DIR / audio_filename

        # Step 1: Preprocessing
        audio_arr, sr = AudioPreprocessor.load_audio(audio_bytes)
        AudioPreprocessor.save_wav(audio_arr, save_path, sr=sr)

        audio_asset = AudioAsset(
            id=asset_id,
            session_id=session_id,
            file_path=str(save_path),
            original_filename=file.filename or "recording.wav",
            file_size_bytes=len(audio_bytes),
            sample_rate=sr,
            channels=1,
            duration_seconds=round(len(audio_arr) / sr, 3),
            format="wav"
        )
        db.add(audio_asset)

        # Step 2: Acoustic VAD
        vad = VoiceActivityDetector(sample_rate=sr, min_pause_threshold_sec=settings.DEFAULT_PAUSE_THRESHOLD_SEC)
        vad_results = vad.process(audio_arr)
        total_dur = vad_results["total_duration"]
        speech_dur = vad_results["speech_duration"]

        # Step 3: Speech to Text
        stt = SpeechToTextEngine.get_instance()
        trans_res = stt.transcribe(audio_arr)

        # Build words with timestamps list
        flat_words = []
        for seg in trans_res.segments:
            for w in seg.words:
                flat_words.append({
                    "word": w.word,
                    "start": w.start,
                    "end": w.end,
                    "probability": w.probability
                })

        # Step 4: Layer 1 Deterministic Metrics
        pause_data = analyze_pauses(vad_results["pause_intervals"], long_pause_threshold_sec=settings.LONG_PAUSE_THRESHOLD_SEC)
        wpm_data = calculate_wpm(len(flat_words), speech_dur, total_dur)
        filler_data = detect_fillers(flat_words, lexicon=settings.FILLER_WORDS)
        word_strings = [w["word"] for w in flat_words]
        rep_data = analyze_repetition_and_diversity(word_strings)
        complex_data = analyze_sentence_complexity(trans_res.full_text)

        timeline = generate_temporal_timeline(
            words_with_timestamps=flat_words,
            pause_intervals=vad_results["pause_intervals"],
            total_duration_seconds=total_dur,
            window_duration_seconds=settings.TEMPORAL_WINDOW_SEC,
            step_duration_seconds=settings.TEMPORAL_WINDOW_STEP_SEC
        )

        # Step 5: Layer 2 ML/NLP
        sentences = [seg.text for seg in trans_res.segments if len(seg.text.strip()) > 0]
        sentence_timestamps = [seg.start for seg in trans_res.segments if len(seg.text.strip()) > 0]
        
        embedder = EmbeddingEngine.get_instance()
        embs = embedder.encode(sentences) if sentences else None
        
        if sentences and embs is not None and len(sentences) > 0:
            coherence_data = compute_semantic_coherence(sentences, embs, timestamps=sentence_timestamps)
            transitions = detect_topic_transitions(sentences, embs, timestamps=sentence_timestamps, threshold=settings.TOPIC_DRIFT_THRESHOLD)
        else:
            coherence_data = {
        "mean_coherence": None,
        "min_coherence": None,
        "pairwise_coherence": [],
        "insufficient_data": True
    }
            transitions = []

        nlp_summary = {
            "mean_coherence": coherence_data["mean_coherence"],
            "transitions": transitions
        }

        # Step 6: Layer 3 Reasoning Synthesis
        metrics_summary_dict = {
            "duration_seconds": total_dur,
            "speech_duration_seconds": speech_dur,
            "total_words": len(flat_words),
            "wpm": wpm_data["wpm"],
            "gross_wpm": wpm_data["gross_wpm"],
            "filler_count": filler_data["filler_count"],
            "filler_density": filler_data["filler_density_pct"],
            "fillers_by_token": filler_data["fillers_by_token"],
            "pause_count": pause_data["pause_count"],
            "long_pause_count": pause_data["long_pause_count"],
            "average_pause_seconds": pause_data["average_pause_seconds"],
            "repetition_rate": rep_data["repetition_rate_pct"],
            "type_token_ratio": rep_data["type_token_ratio"],
            "sentence_count": complex_data["sentence_count"],
            "avg_sentence_length_words": complex_data["avg_sentence_length_words"],
            "mean_coherence": coherence_data["mean_coherence"]
        }
        

        feedback = FeedbackSynthesizer.synthesize_feedback(
            metrics_summary=metrics_summary_dict,
            timeline=timeline,
            nlp_data=nlp_summary,
            transcript_segments=[{"segment_index": s.segment_index, "text": s.text} for s in trans_res.segments]
        )

        # Clear any prior metrics/transcripts if re-analyzing
        await db.execute(delete(CommunicationMetric).where(CommunicationMetric.session_id == session_id))
        await db.execute(delete(TranscriptSegment).where(TranscriptSegment.session_id == session_id))
        await db.execute(delete(FeedbackItem).where(FeedbackItem.session_id == session_id))
        await db.execute(delete(SemanticSegment).where(SemanticSegment.session_id == session_id))
        await db.execute(delete(TopicTransition).where(TopicTransition.session_id == session_id))

        # Persist Transcripts & Words
        filler_spans = [
        (f["start"], f["end"])
        for f in filler_data["detected_fillers"]
            ]
        for seg in trans_res.segments:
            seg_model = TranscriptSegment(
                session_id=session_id,
                segment_index=seg.segment_index,
                text=seg.text,
                start_time=seg.start,
                end_time=seg.end,
                confidence=1.0
            )
            db.add(seg_model)
            await db.flush()

            for w in seg.words:
                w_model = WordToken(
                    segment_id=seg_model.id,
                    session_id=session_id,
                    word=w.word,
                    start_time=w.start,
                    end_time=w.end,
                    confidence=w.probability,
                   is_filler=any(
    start <= w.start and w.end <= end
    for start, end in filler_spans
)
                )
                db.add(w_model)

        # Persist Global Metrics
        for metric_name, val in metrics_summary_dict.items():
            if isinstance(val, (int, float)):
                db.add(CommunicationMetric(
                    session_id=session_id,
                    metric_name=metric_name,
                    metric_value=float(val),
                    calculation_version=settings.CALCULATION_VERSION
                ))

        # Persist Temporal Timeline Window Metrics
        for win in timeline:
            db.add(CommunicationMetric(
                session_id=session_id,
                metric_name="wpm",
                metric_value=float(win["wpm"]),
                window_start=win["window_start"],
                window_end=win["window_end"],
                window_index=win["window_index"],
                calculation_version=settings.CALCULATION_VERSION
            ))
            db.add(CommunicationMetric(
                session_id=session_id,
                metric_name="filler_count",
                metric_value=float(win["filler_count"]),
                window_start=win["window_start"],
                window_end=win["window_end"],
                window_index=win["window_index"],
                calculation_version=settings.CALCULATION_VERSION
            ))
            db.add(CommunicationMetric(
                session_id=session_id,
                metric_name="pause_count",
                metric_value=float(win["pause_count"]),
                window_start=win["window_start"],
                window_end=win["window_end"],
                window_index=win["window_index"],
                calculation_version=settings.CALCULATION_VERSION
            ))
            db.add(CommunicationMetric(
                session_id=session_id,
                metric_name="word_count",
                metric_value=float(win["word_count"]),
                window_start=win["window_start"],
                window_end=win["window_end"],
                window_index=win["window_index"],
                calculation_version=settings.CALCULATION_VERSION
            ))

        # Persist Semantic Segments & Topic Transitions
        for idx, (s_text, s_time) in enumerate(zip(sentences, sentence_timestamps)):
            db.add(SemanticSegment(
                session_id=session_id,
                segment_index=idx,
                text=s_text,
                start_time=s_time,
                coherence_score=coherence_data["pairwise_coherence"][idx]["similarity"] if idx < len(coherence_data["pairwise_coherence"]) else 1.0
            ))

        for trans in transitions:
            db.add(TopicTransition(
                session_id=session_id,
                timestamp=trans["timestamp"],
                from_topic=trans["from_text"][:200],
                to_topic=trans["to_text"][:200],
                drift_score=trans["drift_magnitude"]
            ))

        # Persist Feedback Items
        for item in feedback["items"]:
            db.add(FeedbackItem(
                session_id=session_id,
                category=item["category"],
                message=item["message"],
                evidence_quote=item.get("evidence_quote"),
                evidence_start=item.get("evidence_start"),
                evidence_end=item.get("evidence_end"),
                suggestion=item.get("suggestion"),
                severity=item.get("severity", "info")
            ))

        # Finalize Session Status
        session.status = "completed"
        session.duration_seconds = total_dur
        session.speech_duration_seconds = speech_dur
        session.error_message = None
        await db.commit()

        return {
            "status": "completed",
            "session_id": session_id,
            "duration_seconds": total_dur,
            "speech_duration_seconds": speech_dur,
            "metrics": metrics_summary_dict,
            "feedback_count": len(feedback["items"])
        }

    except Exception as e:
        logger.error(f"Analysis failed for session '{session_id}': {e}", exc_info=True)
        session.status = "failed"
        session.error_message = str(e)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline error: {str(e)}"
        )


@router.get("/{session_id}/metrics", response_model=SummaryMetricsResponse)
async def get_session_metrics(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Returns the consolidated Layer 1 and Layer 2 summary metrics for a session."""
    session_res = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
    session = session_res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")

    metrics_res = await db.execute(
        select(CommunicationMetric)
        .where(CommunicationMetric.session_id == session_id, CommunicationMetric.window_start == None)
    )
    metrics_list = metrics_res.scalars().all()
    metrics_map = {m.metric_name: m.metric_value for m in metrics_list}

    return SummaryMetricsResponse(
        session_id=session_id,
        duration_seconds=session.duration_seconds,
        speech_duration_seconds=session.speech_duration_seconds,
        wpm=metrics_map.get("wpm", 0.0),
        filler_count=int(metrics_map.get("filler_count", 0)),
        filler_density=metrics_map.get("filler_density", 0.0),
        pause_count=int(metrics_map.get("pause_count", 0)),
        long_pause_count=int(metrics_map.get("long_pause_count", 0)),
        average_pause_seconds=metrics_map.get("average_pause_seconds", 0.0),
        repetition_rate=metrics_map.get("repetition_rate", 0.0),
        type_token_ratio=metrics_map.get("type_token_ratio", 0.0),
        sentence_count=int(metrics_map.get("sentence_count", 0)),
        avg_sentence_length_words=metrics_map.get("avg_sentence_length_words", 0.0),
        semantic_coherence_avg=metrics_map.get("mean_coherence")
    )


@router.get("/{session_id}/timeline", response_model=TimelineResponse)
async def get_session_timeline(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves temporal sliding-window data for interactive timeline and pacing graphs."""
    result = await db.execute(
        select(CommunicationMetric)
        .where(CommunicationMetric.session_id == session_id, CommunicationMetric.window_start != None)
        .order_by(CommunicationMetric.window_start)
    )
    metric_rows = result.scalars().all()

    # Group metrics by window_start
    windows_dict = {}
    for row in metric_rows:
        w_start = row.window_start
        if w_start not in windows_dict:
            windows_dict[w_start] = {
                "window_index": row.window_index or 0,
                "window_start": w_start,
                "window_end": row.window_end or (w_start + settings.TEMPORAL_WINDOW_SEC),
                "wpm": 0.0,
                "word_count": 0,
                "filler_count": 0,
                "pause_count": 0,
                "pause_duration": 0.0,
                "coherence_score": 1.0,
                "transcript_snippet": ""
            }
        if row.metric_name == "wpm":
            windows_dict[w_start]["wpm"] = row.metric_value
        elif row.metric_name == "word_count":
            windows_dict[w_start]["word_count"] = int(row.metric_value)
        elif row.metric_name == "filler_count":
            windows_dict[w_start]["filler_count"] = int(row.metric_value)
        elif row.metric_name == "pause_count":
            windows_dict[w_start]["pause_count"] = int(row.metric_value)

    points = [TimelineWindowPoint(**v) for v in sorted(windows_dict.values(), key=lambda x: x["window_start"])]

    return TimelineResponse(
        session_id=session_id,
        window_size_seconds=settings.TEMPORAL_WINDOW_SEC,
        step_size_seconds=settings.TEMPORAL_WINDOW_STEP_SEC,
        windows=points
    )


@router.get("/{session_id}/transcript", response_model=FullTranscriptResponse)
async def get_session_transcript(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Returns timestamped speech segments and word tokens."""
    seg_res = await db.execute(
        select(TranscriptSegment)
        .where(TranscriptSegment.session_id == session_id)
        .order_by(TranscriptSegment.start_time)
    )
    segments = seg_res.scalars().all()

    # Fetch word tokens
    words_res = await db.execute(
        select(WordToken)
        .where(WordToken.session_id == session_id)
        .order_by(WordToken.start_time)
    )
    words = words_res.scalars().all()

    words_by_seg = {}
    for w in words:
        words_by_seg.setdefault(w.segment_id, []).append(
            WordTokenResponse(
                id=w.id,
                word=w.word,
                start_time=w.start_time,
                end_time=w.end_time,
                confidence=w.confidence,
                is_filler=w.is_filler
            )
        )

    segment_responses = []
    for s in segments:
        segment_responses.append(
            TranscriptSegmentResponse(
                id=s.id,
                segment_index=s.segment_index,
                text=s.text,
                start_time=s.start_time,
                end_time=s.end_time,
                confidence=s.confidence,
                speaker_id=s.speaker_id,
                words=words_by_seg.get(s.id, [])
            )
        )

    full_text = " ".join(s.text for s in segments)
    return FullTranscriptResponse(
        session_id=session_id,
        full_text=full_text,
        segments=segment_responses
    )
