'use client';

import { useEffect, useState, useRef } from "react";
import { 
  CheckCircle2, Loader2, Sparkles, AlertCircle, Tag, RotateCcw, 
  ShieldCheck, Gauge, AlertTriangle, Pause, Hash, Terminal, Mic, 
  Square, Radio, Compass, Layers, ChevronRight, Activity, ArrowRight
} from "lucide-react";
import { 
  listInterviewQuestions, createSession, uploadAndAnalyzeAudio, evaluateInterview, analyzeInterviewQuestion 
} from "@/lib/api";
import { 
  InterviewQuestion, InterviewEvaluation, QuestionAnalysisResult, CustomQuestionInput 
} from "@/lib/types";
import { AudioRecorder } from "@/lib/audio-recorder";
import { PageHeader } from "@/components/ui/page-header";
import { AudioLevelMeter } from "@/components/ui/audio-level-meter";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EvidenceBlock } from "@/components/ui/evidence-block";
import { cn } from "@/lib/utils";

export default function InterviewPage() {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);

  // Custom question state
  const [customPrompt, setCustomPrompt] = useState("");
  const [customCategory, setCustomCategory] = useState("Auto-Detect");
  const [isAnalyzingQuestion, setIsAnalyzingQuestion] = useState(false);
  const [analyzedCustomQuestion, setAnalyzedCustomQuestion] = useState<QuestionAnalysisResult | null>(null);

  // Recording & Evaluation state
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
      } catch {
        setErrorMessage("Failed to load interview questions.");
      }
    }
    loadQuestions();
  }, []);

  const handleAnalyzeCustomQuestion = async () => {
    if (!customPrompt.trim() || customPrompt.trim().length < 5) {
      setErrorMessage("Please enter an interview question containing at least 5 characters.");
      return;
    }
    try {
      setErrorMessage(null);
      setIsAnalyzingQuestion(true);
      const catParam = customCategory === "Auto-Detect" ? undefined : customCategory;
      const res = await analyzeInterviewQuestion(customPrompt.trim(), catParam);
      setAnalyzedCustomQuestion(res);
      setEvaluation(null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to analyze question.");
    } finally {
      setIsAnalyzingQuestion(false);
    }
  };

  const handleStartRecording = async () => {
    const currentQ = mode === "preset" ? selectedQuestion : analyzedCustomQuestion;
    if (!currentQ) {
      setErrorMessage(mode === "preset" ? "Please select a question." : "Please analyze your custom question first.");
      return;
    }

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
    if (!recorderRef.current) return;
    const currentQ = mode === "preset" ? selectedQuestion : analyzedCustomQuestion;
    if (!currentQ) return;

    try {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setIsEvaluating(true);

      const audioBlob = await recorderRef.current.stop();
      recorderRef.current = null;

      // 1. Create interview session
      const titlePrefix = mode === "preset" ? "Preset" : "Custom";
      const session = await createSession(
        `Interview (${titlePrefix}): ${currentQ.title}`,
        "interview"
      );

      // 2. Upload audio and run complete analysis
      await uploadAndAnalyzeAudio(session.id, audioBlob, currentQ.id);

      // 3. Run Rubric Evaluation
      let evalRes: InterviewEvaluation;
      if (mode === "preset") {
        evalRes = await evaluateInterview(session.id, currentQ.id);
      } else {
        const customInput: CustomQuestionInput = {
          prompt: analyzedCustomQuestion!.prompt,
          category: analyzedCustomQuestion!.category,
          title: analyzedCustomQuestion!.title,
          difficulty: analyzedCustomQuestion!.difficulty,
          question_type: analyzedCustomQuestion!.question_type,
          major_concepts: analyzedCustomQuestion!.major_concepts,
          expected_points: analyzedCustomQuestion!.expected_points,
          rubric_criteria: analyzedCustomQuestion!.rubric_criteria,
        };
        evalRes = await evaluateInterview(session.id, analyzedCustomQuestion!.id, customInput);
      }
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

  const activeQuestion = mode === "preset" ? selectedQuestion : analyzedCustomQuestion;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <PageHeader 
        kicker="INTELLIGENCE_COCKPIT"
        title="AI Interview Console & Evaluation Dossier" 
        subtitle="Practice with curated engineering presets or enter any custom prompt. VOXIQ locally decomposes the question, extracts technical concepts via KeyBERT+MMR, generates a dynamic rubric, and evaluates your spoken response across multiple scientific dimensions."
      />

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Console Bar: Mode Switcher & Engine Diagnostics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-xl bg-[#0b1120] border border-white/[0.08]">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#060913] border border-white/[0.06]">
          <button
            onClick={() => {
              if (!isRecording && !isEvaluating) {
                setMode("preset");
                setEvaluation(null);
              }
            }}
            disabled={isRecording || isEvaluating}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all",
              mode === "preset"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            CURATED_PRESETS (3)
          </button>
          <button
            onClick={() => {
              if (!isRecording && !isEvaluating) {
                setMode("custom");
                setEvaluation(null);
              }
            }}
            disabled={isRecording || isEvaluating}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center gap-1.5",
              mode === "custom"
                ? "bg-violet-500 text-white font-bold shadow-[0_0_12px_rgba(167,139,250,0.3)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>CUSTOM_QUESTION_ENGINE</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 px-2">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Radio className="w-3.5 h-3.5" />
            <span>NLP_DECOMPOSITION: LOCAL</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>MMR_DIVERSITY: 0.65</span>
        </div>
      </div>

      {/* Split-Screen Interactive Cockpit (40% Left / 60% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Question Intelligence Dossier (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Preset Selector */}
          {mode === "preset" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2.5">
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
                    className={cn(
                      "p-3.5 rounded-xl text-left border transition-all duration-150 relative overflow-hidden",
                      selectedQuestion?.id === q.id
                        ? "bg-[#0f172a] border-cyan-400/50 shadow-[0_0_20px_rgba(0,229,255,0.12)]"
                        : "bg-[#0b1120]/90 border-white/[0.06] hover:border-white/[0.12] hover:bg-[#0d1424]"
                    )}
                  >
                    {selectedQuestion?.id === q.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
                    )}
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider mb-1">
                      <span className="text-cyan-400 font-semibold">{q.category}</span>
                      <span className="text-slate-500">{q.difficulty}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">{q.title}</div>
                  </button>
                ))}
              </div>

              {/* Selected Preset Dossier Card */}
              {selectedQuestion && (
                <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-md space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      VERIFIED_RUBRIC_SPEC
                    </span>
                    <StatusBadge variant="emerald">
                      <ShieldCheck className="w-3 h-3 mr-1 inline" />
                      GOLDEN_REFERENCE
                    </StatusBadge>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white leading-snug">{selectedQuestion.title}</h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-[#060913]/60 p-3 rounded-lg border border-white/[0.04]">
                      {selectedQuestion.prompt}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                      Expected Engineering Points:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedQuestion.expected_points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-mono text-[10px] mt-0.5">✓</span>
                          <span className="leading-snug text-slate-400">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Question Terminal & Decomposition */}
          {mode === "custom" && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-md space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-violet-400 font-semibold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>QUESTION_INPUT_TERMINAL</span>
                  </span>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    disabled={isAnalyzingQuestion || isRecording}
                    aria-label="Target Domain"
                    className="bg-[#060913] border border-white/[0.1] text-[11px] text-slate-300 rounded px-2.5 py-1 focus:outline-none focus:border-violet-400 font-mono"
                  >
                    <option value="Auto-Detect">Auto-Detect Domain</option>
                    <option value="System Architecture">System Architecture</option>
                    <option value="Data Structures & Algorithms">Algorithms</option>
                    <option value="Software Architecture">Software Architecture</option>
                    <option value="Behavioral & Leadership">Behavioral</option>
                    <option value="Site Reliability & Debugging">SRE & Debugging</option>
                  </select>
                </div>

                <textarea
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter any technical architecture, algorithm, trade-off, or behavioral question..."
                  disabled={isRecording || isEvaluating || isAnalyzingQuestion}
                  className="w-full bg-[#060913] border border-white/[0.08] rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-400 resize-none font-mono leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    OFFLINE KEYBERT+MMR
                  </span>
                  <button
                    onClick={handleAnalyzeCustomQuestion}
                    disabled={isAnalyzingQuestion || isRecording || !customPrompt.trim()}
                    className="px-3.5 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(167,139,250,0.3)] transition disabled:opacity-50"
                  >
                    {isAnalyzingQuestion ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>DECOMPOSING...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ANALYZE_PROMPT</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Analyzed Custom Question Dossier */}
              {analyzedCustomQuestion && (
                <div className="p-5 rounded-xl border border-violet-500/30 bg-[#0b1120]/90 backdrop-blur-md space-y-4 shadow-xl animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-2.5">
                    <StatusBadge variant="violet">
                      {analyzedCustomQuestion.question_type_label}
                    </StatusBadge>
                    <span className="text-[10px] font-mono text-slate-400">
                      CONFIDENCE: {((analyzedCustomQuestion.classification_confidence || 0.8) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">{analyzedCustomQuestion.title}</h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-[#060913]/60 p-2.5 rounded-lg border border-white/[0.04]">
                      {analyzedCustomQuestion.prompt}
                    </p>
                  </div>

                  {/* Extracted Major Concepts (KeyBERT + MMR) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-violet-300 font-semibold tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-violet-400" />
                      Extracted Technical Concepts (KeyBERT + MMR):
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analyzedCustomQuestion.major_concepts.map((concept, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-violet-950/40 border border-violet-500/30 text-violet-300 font-mono text-[11px]"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Synthesized Answer Areas */}
                  <div className="pt-2 border-t border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 font-medium">
                      Synthesized Expected Points:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {analyzedCustomQuestion.expected_points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-violet-400 font-mono text-[10px]">→</span>
                          <span className="text-slate-300 leading-snug">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Pane: Live Response Bay & Evaluation Report (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Question Prompt & Live Recording Bay */}
          {activeQuestion && (
            <div className="p-6 sm:p-7 rounded-2xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-xl relative shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-cyan-400 font-semibold flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  <span>INTERVIEW_RESPONSE_BAY</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {isRecording ? "RECORDING_RESPONSE" : isEvaluating ? "EVALUATING_ANSWER" : "WAITING_FOR_TRIGGER"}
                </span>
              </div>

              {/* Central Trigger & Timer */}
              <div className="flex flex-col items-center justify-center py-4 space-y-5 text-center">
                <div className="relative">
                  <div 
                    className={cn(
                      "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
                      isRecording 
                        ? "bg-rose-500/15 border-2 border-rose-500 shadow-[0_0_35px_rgba(251,113,133,0.4)] scale-105"
                        : isEvaluating 
                        ? "bg-cyan-500/15 border border-cyan-500 shadow-[0_0_25px_rgba(0,229,255,0.25)]"
                        : "bg-[#060913] border border-white/[0.1] shadow-xl hover:border-cyan-400/50"
                    )}
                    style={{
                      boxShadow: isRecording
                        ? `0 0 ${Math.round(20 + rmsLevel * 45)}px rgba(251, 113, 133, 0.45)`
                        : undefined,
                    }}
                  >
                    {isEvaluating ? (
                      <div className="flex flex-col items-center justify-center space-y-1.5">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        <span className="text-[9px] font-mono text-cyan-300">EVALUATING</span>
                      </div>
                    ) : isRecording ? (
                      <button
                        onClick={handleStopAndEvaluate}
                        className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-lg transition active:scale-95"
                        aria-label="Finish and Evaluate Answer"
                      >
                        <Square className="w-6 h-6 text-white fill-current" />
                      </button>
                    ) : (
                      <button
                        onClick={handleStartRecording}
                        className="w-18 h-18 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 hover:from-cyan-300 hover:to-sky-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.35)] transition active:scale-95 group"
                        aria-label="Record Spoken Answer"
                      >
                        <Mic className="w-7 h-7 text-slate-950 group-hover:scale-105 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white tabular-nums">
                    {formatTimer(elapsedSeconds)}
                  </div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-slate-400">
                    {isEvaluating
                      ? "LOCAL_RUBRIC_EVALUATION_IN_PROGRESS"
                      : isRecording
                      ? "SPEAK_ANSWER_CLEARLY"
                      : "CLICK_TO_RECORD_RESPONSE"}
                  </p>
                </div>

                {isRecording && (
                  <AudioLevelMeter level={rmsLevel} bars={24} height={32} showVUHeadroom={false} />
                )}
              </div>
            </div>
          )}

          {/* Multi-Tier Evaluation Report Section */}
          {evaluation && (
            <div className="p-6 sm:p-7 rounded-2xl border border-white/[0.08] bg-[#0b1120]/95 backdrop-blur-xl relative shadow-2xl space-y-6 animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-semibold text-white">Interview Evaluation Dossier</h3>
                </div>
                <button
                  onClick={() => setEvaluation(null)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET_CONSOLE</span>
                </button>
              </div>

              {/* Tier 2: Semantic & Content Coverage Radar */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                  TIER_02: SEMANTIC & CONTENT COVERAGE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-[#060913] border border-white/[0.06] text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Semantic Relevance</span>
                    <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums">
                      {evaluation.relevance_score.toFixed(1)}%
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">Prompt Cosine Alignment</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#060913] border border-white/[0.06] text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Rubric Coverage</span>
                    <div className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                      {evaluation.completeness_score.toFixed(1)}%
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">Expected Areas Covered</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#060913] border border-white/[0.06] text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Structure Framing</span>
                    <div className="text-2xl font-mono font-bold text-violet-400 tabular-nums">
                      {evaluation.structure_score.toFixed(1)}%
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">Discourse Progression</span>
                  </div>
                </div>
              </div>

              {/* Concept Coverage Matrix */}
              {evaluation.concept_coverage && evaluation.concept_coverage.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Concept Coverage Matrix:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {evaluation.concept_coverage.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#060913] border border-white/[0.06] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-slate-200 truncate">{item.concept}</span>
                          <StatusBadge variant={item.is_covered ? "emerald" : "amber"}>
                            {(item.coverage_score * 100).toFixed(0)}%
                          </StatusBadge>
                        </div>
                        {item.evidence_sentence && (
                          <p className="text-[11px] italic text-slate-400 leading-snug line-clamp-2">
                            &ldquo;{item.evidence_sentence}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 1: Deterministic Communication Telemetry */}
              {evaluation.communication_metrics && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                    TIER_01: COMMUNICATION TELEMETRY
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <MetricCard
                      label="Speaking Rate"
                      value={evaluation.communication_metrics.wpm.toFixed(1)}
                      unit="WPM"
                      icon={Gauge}
                      accentColor="emerald"
                    />
                    <MetricCard
                      label="Filler Density"
                      value={evaluation.communication_metrics.filler_density.toFixed(1)}
                      unit="%"
                      icon={AlertTriangle}
                      accentColor="amber"
                    />
                    <MetricCard
                      label="Filler Count"
                      value={evaluation.communication_metrics.filler_count}
                      unit="tokens"
                      icon={Hash}
                      accentColor="sky"
                    />
                    <MetricCard
                      label="Acoustic Pauses"
                      value={evaluation.communication_metrics.pause_count}
                      subtitle={`${evaluation.communication_metrics.average_pause_seconds.toFixed(2)}s avg`}
                      icon={Pause}
                      accentColor="indigo"
                    />
                  </div>
                </div>
              )}

              {/* Rubric Criteria Scorecards */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Rubric Criteria Scorecards:
                </span>
                {evaluation.criteria.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#060913] border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-100">{c.criterion}</span>
                      <StatusBadge variant={c.score >= 0.8 ? "emerald" : "amber"}>
                        Score: {(c.score * 100).toFixed(0)}%
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{c.feedback}</p>
                    {c.evidence && (
                      <EvidenceBlock quote={c.evidence} sourceLabel="CRITERION_PROOF" />
                    )}
                  </div>
                ))}
              </div>

              {/* Executive Feedback Callout */}
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 text-xs text-violet-200 leading-relaxed space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold block">
                  SYNTHESIZED_EXECUTIVE_SUMMARY:
                </span>
                <p>{evaluation.summary_feedback}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
