'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertCircle, Mic, Square, Loader2, Activity, Radio, 
  Settings2, Gauge, CheckCircle2, ChevronRight, ArrowRight
} from "lucide-react";
import { AudioRecorder } from "@/lib/audio-recorder";
import { createSession, uploadAndAnalyzeAudio } from "@/lib/api";
import { AudioLevelMeter } from "@/components/ui/audio-level-meter";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

export default function RecordPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [rmsLevel, setRmsLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0); // 0 to 4
  const [sessionTitle, setSessionTitle] = useState("Free Practice Session");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      const recorder = new AudioRecorder(16000);
      await recorder.start((level) => {
        setRmsLevel(level);
      });
      recorderRef.current = recorder;
      setIsRecording(true);
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Microphone permission denied or audio device unavailable.";
      setErrorMessage(msg);
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    try {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      setIsAnalyzing(true);
      setProcessingStage(1); // Stage 1: Audio Blob Captured
      const audioBlob = await recorderRef.current.stop();
      recorderRef.current = null;

      setProcessingStage(2); // Stage 2: Create Session
      const session = await createSession(sessionTitle || "Practice Session", "practice");

      setProcessingStage(3); // Stage 3: Whisper Transcription & 3-Layer Analytics
      await uploadAndAnalyzeAudio(session.id, audioBlob);

      setProcessingStage(4); // Stage 4: Finalizing
      router.push(`/sessions/${session.id}`);
    } catch (err: unknown) {
      setIsAnalyzing(false);
      setProcessingStage(0);
      const msg = err instanceof Error ? err.message : "Failed to analyze audio.";
      setErrorMessage(msg);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const pipelineStages = [
    { id: 1, title: "16kHz Resampling", subtitle: "Float32 PCM Normalization" },
    { id: 2, title: "Acoustic VAD Framing", subtitle: "Speech vs Silence Segmentation" },
    { id: 3, title: "Faster-Whisper ASR", subtitle: "Timestamped Word Tokenization" },
    { id: 4, title: "3-Layer Telemetry", subtitle: "Pacing, Coherence, & Feedback" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <PageHeader 
        kicker="RECORDING_STUDIO"
        title="Speech Recording & Telemetry Bay" 
        subtitle="Speak freely. VOXIQ pre-processes audio at 16kHz, performs acoustic VAD segmentation, Faster-Whisper transcription, and extracts Layer 1-3 communication telemetry."
      />

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dual-Pane Studio Recording Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Master Recording Console (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-2xl space-y-6">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-500 to-transparent" />

          {/* Console Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-cyan-400 font-semibold flex items-center gap-2">
              <Radio className={cn("w-3.5 h-3.5", isRecording ? "text-rose-400 animate-pulse" : "text-cyan-400")} />
              <span>{isRecording ? "ACOUSTIC_STREAM_LIVE" : "CONSOLE_STANDBY"}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              BUFFER: 16000Hz_MONO
            </span>
          </div>

          {/* Center Stage: Studio Record Button & High-Precision Timecode */}
          <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
            {/* Studio Record Trigger with Multi-Layer Glow */}
            <div className="relative">
              <div 
                className={cn(
                  "w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300",
                  isRecording 
                    ? "bg-rose-500/15 border-2 border-rose-500 shadow-[0_0_40px_rgba(251,113,133,0.35)] scale-105"
                    : isAnalyzing 
                    ? "bg-cyan-500/15 border border-cyan-500 shadow-[0_0_30px_rgba(0,229,255,0.25)]"
                    : "bg-[#060913] border border-white/[0.1] shadow-xl hover:border-cyan-400/50"
                )}
                style={{
                  boxShadow: isRecording
                    ? `0 0 ${Math.round(25 + rmsLevel * 50)}px rgba(251, 113, 133, 0.45)`
                    : undefined,
                }}
              >
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                    <span className="text-[10px] font-mono text-cyan-300">ANALYZING</span>
                  </div>
                ) : isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    aria-label="Stop recording"
                  >
                    <Square className="w-7 h-7 text-white fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 hover:from-cyan-300 hover:to-sky-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all active:scale-95 group"
                    aria-label="Start recording"
                  >
                    <Mic className="w-8 h-8 text-slate-950 group-hover:scale-105 transition-transform" />
                  </button>
                )}
              </div>
            </div>

            {/* Precision Timecode */}
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white tabular-nums drop-shadow-md">
                {formatTimer(elapsedSeconds)}
                <span className="text-sm font-normal text-slate-500 ml-1">sec</span>
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-slate-400">
                {isAnalyzing 
                  ? "PROCESSING_TELEMETRY_PIPELINE" 
                  : isRecording 
                  ? "RECORDING_ACTIVE_SIGNAL" 
                  : "CLICK_MIC_TO_INITIALIZE"}
              </p>
            </div>
          </div>

          {/* Real-Time Acoustic Spectrum Visualizer */}
          <div className="pt-2">
            <AudioLevelMeter level={rmsLevel} bars={28} height={40} showVUHeadroom={true} />
          </div>
        </div>

        {/* Right Configuration Deck & Processing Pipeline (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-xl relative shadow-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Deck Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-cyan-400 font-semibold flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5" />
                <span>SESSION_CONFIG</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                MODE: PRACTICE
              </span>
            </div>

            {/* Session Title Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase text-slate-400 tracking-wider block">
                Session Identifier / Topic
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                disabled={isRecording || isAnalyzing}
                placeholder="e.g., Free Practice: System Design Overview"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/[0.1] text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Target Pacing Reference Gauge */}
            <div className="p-4 rounded-xl bg-[#060913]/90 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  Target Speaking Rate
                </span>
                <span className="text-cyan-400 font-mono font-semibold">130 – 160 WPM</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Benchmark communication pacing recommended for executive presentations and technical interviews.
              </p>
            </div>

            {/* Real-Time Processing Pipeline Tracker (shown when analyzing) */}
            {isAnalyzing && (
              <div className="p-4 rounded-xl bg-[#060913] border border-cyan-500/30 space-y-3 animate-fade-in shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block border-b border-white/[0.06] pb-1.5">
                  ANALYSIS_PIPELINE_PROGRESS:
                </span>
                <div className="space-y-2.5">
                  {pipelineStages.map((stage) => {
                    const isDone = processingStage > stage.id;
                    const isCurrent = processingStage === stage.id;
                    return (
                      <div key={stage.id} className="flex items-start gap-2.5 text-xs">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/[0.1] flex-shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className={cn("font-mono font-medium text-xs", isCurrent ? "text-cyan-300" : isDone ? "text-slate-300" : "text-slate-600")}>
                            {stage.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">{stage.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick tips footer */}
          <div className="p-3 rounded-xl bg-[#060913]/60 border border-white/[0.05] text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>MIC_SAMPLING: 16,000 Hz</span>
            <span>VAD_THRESHOLD: 0.5s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
