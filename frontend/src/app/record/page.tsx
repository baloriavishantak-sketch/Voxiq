'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, AlertCircle, PlayCircle } from "lucide-react";
import { AudioRecorder } from "@/lib/audio-recorder";
import { createSession, uploadAndAnalyzeAudio } from "@/lib/api";

export default function RecordPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [rmsLevel, setRmsLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      const audioBlob = await recorderRef.current.stop();
      recorderRef.current = null;

      // 1. Create Session
      const session = await createSession(sessionTitle || "Practice Session", "practice");

      // 2. Upload and Analyze
      await uploadAndAnalyzeAudio(session.id, audioBlob);

      // 3. Navigate to results
      router.push(`/sessions/${session.id}`);
    } catch (err: unknown) {
      setIsAnalyzing(false);
      const msg = err instanceof Error ? err.message : "Failed to analyze audio.";
      setErrorMessage(msg);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Speech Recording & Analysis</h1>
        <p className="text-sm text-slate-400 mt-1">
          Speak freely. VOXIQ pre-processes audio at 16kHz, performs acoustic VAD, Faster-Whisper transcription, 
          and extracts Layer 1-3 metrics.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="p-8 rounded-3xl bg-[#0d1527] border border-slate-800 shadow-xl flex flex-col items-center justify-center space-y-6 text-center">
        {/* Session Title Input */}
        <div className="w-full max-w-sm">
          <input
            type="text"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            disabled={isRecording || isAnalyzing}
            placeholder="Session Title"
            className="w-full px-4 py-2 text-center rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-sky-500 text-slate-200"
          />
        </div>

        {/* Live Audio Meter & Visualizer */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-150 ${
              isRecording
                ? "bg-rose-500/20 border-2 border-rose-500 shadow-lg shadow-rose-500/30 scale-105"
                : "bg-slate-800/40 border border-slate-700"
            }`}
            style={{
              boxShadow: isRecording
                ? `0 0 ${Math.round(rmsLevel * 40)}px rgba(244, 63, 94, 0.4)`
                : undefined,
            }}
          >
            {isAnalyzing ? (
              <Loader2 className="w-12 h-12 text-sky-400 animate-spin" />
            ) : isRecording ? (
              <button
                onClick={handleStopRecording}
                className="w-24 h-24 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-lg transition-transform active:scale-95"
              >
                <Square className="w-8 h-8 text-white fill-current" />
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                className="w-24 h-24 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
              >
                <Mic className="w-10 h-10 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Live Timer & RMS Meter */}
        <div className="space-y-2">
          <div className="text-4xl font-mono font-bold tracking-wider text-slate-100">
            {formatTimer(elapsedSeconds)}
          </div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            {isAnalyzing ? "Processing 3-Layer Analytics..." : isRecording ? "Recording Live Audio" : "Ready to Record"}
          </div>

          {isRecording && (
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto mt-3">
              <div
                className="h-full bg-emerald-400 transition-all duration-75"
                style={{ width: `${Math.round(rmsLevel * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Control Button Hints */}
        <div className="text-xs text-slate-500">
          {isRecording
            ? "Click the red button to finish and trigger multi-layered analysis"
            : "Click microphone to start capturing your voice"}
        </div>
      </div>
    </div>
  );
}
