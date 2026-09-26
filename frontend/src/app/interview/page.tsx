'use client';

import { useEffect, useState, useRef } from "react";
import { 
  HelpCircle, Mic, Square, CheckCircle2, ChevronRight, Loader2, Sparkles, AlertCircle 
} from "lucide-react";
import { 
  listInterviewQuestions, createSession, uploadAndAnalyzeAudio, evaluateInterview 
} from "@/lib/api";
import { 
  InterviewQuestion, InterviewEvaluation 
} from "@/lib/types";
import { AudioRecorder } from "@/lib/audio-recorder";

export default function InterviewPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [rmsLevel, setRmsLevel] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const qList = await listInterviewQuestions();
        setQuestions(qList);
        if (qList.length > 0) {
          setSelectedQuestion(qList[0]);
        }
      } catch (err) {
        setErrorMessage("Failed to load interview questions.");
      }
    }
    loadQuestions();
  }, []);

  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      setEvaluation(null);
      const recorder = new AudioRecorder(16000);
      await recorder.start((lvl) => setRmsLevel(lvl));
      recorderRef.current = recorder;
      setIsRecording(true);
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Microphone error.");
    }
  };

  const handleStopAndEvaluate = async () => {
    if (!recorderRef.current || !selectedQuestion) return;
    try {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setIsEvaluating(true);

      const audioBlob = await recorderRef.current.stop();
      recorderRef.current = null;

      // 1. Create interview session
      const session = await createSession(
        `Interview: ${selectedQuestion.title}`,
        "interview"
      );

      // 2. Upload audio and run complete analysis
      await uploadAndAnalyzeAudio(session.id, audioBlob, selectedQuestion.id);

      // 3. Run Rubric Evaluation
      const evalRes = await evaluateInterview(session.id, selectedQuestion.id);
      setEvaluation(evalRes);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Evaluation failed.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Interview Mode</h1>
        <p className="text-sm text-slate-400 mt-1">
          Select an interview prompt, record your spoken technical answer, and receive rubric-guided evaluation.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Question Selector Carousel / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => {
              if (!isRecording && !isEvaluating) {
                setSelectedQuestion(q);
                setEvaluation(null);
              }
            }}
            disabled={isRecording || isEvaluating}
            className={`p-4 rounded-2xl text-left border transition-all ${
              selectedQuestion?.id === q.id
                ? "bg-[#0d1527] border-sky-500 shadow-md shadow-sky-500/10"
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-70"
            }`}
          >
            <div className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">{q.category}</div>
            <div className="text-sm font-semibold text-slate-200 mt-1 line-clamp-1">{q.title}</div>
            <div className="text-xs text-slate-500 mt-1">{q.difficulty}</div>
          </button>
        ))}
      </div>

      {/* Active Question Prompt Display */}
      {selectedQuestion && (
        <div className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-4">
          <div>
            <span className="text-[11px] font-mono text-sky-400 uppercase tracking-widest">Selected Prompt</span>
            <h2 className="text-xl font-bold text-white mt-1">{selectedQuestion.title}</h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{selectedQuestion.prompt}</p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Expected Rubric Points:
            </span>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-400">
              {selectedQuestion.expected_points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recording Control */}
      <div className="p-8 rounded-3xl bg-[#0d1527] border border-slate-800 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="relative">
          {isEvaluating ? (
            <div className="w-24 h-24 rounded-full bg-sky-500/20 border border-sky-500 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
            </div>
          ) : isRecording ? (
            <button
              onClick={handleStopAndEvaluate}
              className="w-24 h-24 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-lg transition active:scale-95"
            >
              <Square className="w-8 h-8 text-white fill-current" />
            </button>
          ) : (
            <button
              onClick={handleStartRecording}
              className="w-24 h-24 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              <Mic className="w-10 h-10 text-white" />
            </button>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-mono font-bold text-white">{formatTimer(elapsedSeconds)}</div>
          <div className="text-xs text-slate-400 uppercase font-mono tracking-widest">
            {isEvaluating ? "Evaluating Rubric & Content Coverage..." : isRecording ? "Recording Answer" : "Ready to Answer"}
          </div>
        </div>
      </div>

      {/* Rubric Evaluation Results */}
      {evaluation && (
        <section className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Interview Rubric Evaluation</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-mono">Semantic Relevance</div>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{evaluation.relevance_score.toFixed(1)}%</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-mono">Rubric Coverage</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{evaluation.completeness_score.toFixed(1)}%</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-mono">Structure Quality</div>
              <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">{evaluation.structure_score.toFixed(1)}%</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Criteria Breakdown</h3>
            {evaluation.criteria.map((c, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">{c.criterion}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${c.score >= 0.8 ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
                    Score: {(c.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-slate-300">{c.feedback}</div>
                {c.evidence && (
                  <div className="text-[11px] italic text-slate-500 pt-1 font-serif">
                   Evidence: {c.evidence}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            {evaluation.summary_feedback}
          </div>
        </section>
      )}
    </div>
  );
}
