'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Clock, Activity, Gauge, Pause, AlertTriangle, 
  BookOpen, Sparkles, HelpCircle, Layers, CheckCircle2, Info
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar 
} from "recharts";
import { 
  getSession, getSessionMetrics, getSessionTimeline, 
  getSessionTranscript, getSessionFeedback 
} from "@/lib/api";
import { 
  Session, SummaryMetrics, TimelineData, FullTranscript, FeedbackData 
} from "@/lib/types";

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [transcript, setTranscript] = useState<FullTranscript | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const speechWindows = timeline?.windows.filter(
  (window) => window.word_count > 0
) ?? [];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sessData, metricData, timeData, transData, feedData] = await Promise.all([
          getSession(sessionId),
          getSessionMetrics(sessionId),
          getSessionTimeline(sessionId),
          getSessionTranscript(sessionId),
          getSessionFeedback(sessionId),
        ]);
        setSession(sessData);
        setMetrics(metricData);
        setTimeline(timeData);
        setTranscript(transData);
        setFeedback(feedData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load session analytics.");
      } finally {
        setLoading(false);
      }
    }
    if (sessionId) {
      loadData();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Activity className="w-10 h-10 animate-spin text-sky-400 mx-auto" />
        <p className="text-sm text-slate-400">Loading session telemetry and multi-layer analysis...</p>
      </div>
    );
  }

  if (error || !session || !metrics) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || "Session not found."}</p>
        <Link href="/sessions" className="text-sky-400 hover:underline text-sm">
          Return to Sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <Link href="/sessions" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sessions</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{session.title}</h1>
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400">
              {session.mode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            Total: {session.duration_seconds.toFixed(1)}s
          </span>
          <span>|</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            Active Speech: {session.speech_duration_seconds.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Layer 1 & 2 Metric Cards Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>Layer 1 & 2 Core Measurements</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-500">Calculation Version: 1.0.0</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* WPM Card */}
          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 relative group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Active Speaking Rate</span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">
              {metrics.wpm.toFixed(1)} <span className="text-sm font-normal text-slate-400">WPM</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">
              formula: words / (speech_sec / 60)
            </div>
          </div>

          {/* Fillers Card */}
          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 relative group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Filler Word Density</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">
              {metrics.filler_density.toFixed(1)}% <span className="text-sm font-normal text-slate-400">({metrics.filler_count}x)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">
              formula: (fillers / words) * 100
            </div>
          </div>

          {/* Pauses Card */}
          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 relative group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Acoustic Pauses (&gt;0.5s)</span>
              <Pause className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">
              {metrics.average_pause_seconds.toFixed(2)}s <span className="text-sm font-normal text-slate-400">avg ({metrics.pause_count}x)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">
              long pauses (&gt;1.2s): {metrics.long_pause_count}
            </div>
          </div>

          {/* Coherence Card */}
          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 relative group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Semantic Coherence</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">
              {metrics.semantic_coherence_avg !== null
  ? metrics.semantic_coherence_avg.toFixed(2)
  : "N/A"}{" "}
<span className="text-sm font-normal text-slate-400">/ 1.0</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">
              cosine similarity between sentences
            </div>
          </div>
        </div>

        {/* Secondary Linguistic Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Lexical Repetition</div>
            <div className="text-lg font-mono font-semibold text-slate-200 mt-0.5">{metrics.repetition_rate.toFixed(1)}%</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Vocabulary TTR (Diversity)</div>
            <div className="text-lg font-mono font-semibold text-slate-200 mt-0.5">{metrics.type_token_ratio.toFixed(3)}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Parsed Sentences</div>
            <div className="text-lg font-mono font-semibold text-slate-200 mt-0.5">{metrics.sentence_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Mean Sentence Length</div>
            <div className="text-lg font-mono font-semibold text-slate-200 mt-0.5">{metrics.avg_sentence_length_words.toFixed(1)} words</div>
          </div>
        </div>
      </section>

      {/* Temporal Timeline Pacing Dynamics */}
      {timeline && timeline.windows.length > 0 && (
        <section className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Temporal Communication Dynamics (Pacing Timeline)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Divided into {timeline.window_size_seconds}s time windows to detect speech rate acceleration and hesitation clustering.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
          
            <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={speechWindows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="window_start" 
                  tickFormatter={(val) => `${val}s`} 
                  stroke="#64748b" 
                  fontSize={11} 
                />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                  labelFormatter={(val) => `Time: ${val}s - ${Number(val) + timeline.window_size_seconds}s`}
                />
                <Area 
                  type="monotone" 
                  dataKey="wpm" 
                  name="Speaking Rate (WPM)" 
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#wpmGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Layer 3 Evidence-Backed Feedback */}
      {feedback && feedback.items.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Evidence-Backed Feedback & Recommendations</h2>
          </div>
          <p className="text-xs text-slate-400 -mt-2">
            Every recommendation is traceable to acoustic timestamps and concrete measurements.
          </p>

          <div className="grid gap-3">
            {feedback.items.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                    Category: {item.category}
                  </span>
                  {item.evidence_start !== undefined && item.evidence_end !== undefined && (
                    <span className="text-[11px] font-mono text-slate-500">
                     Timestamp: {item.evidence_start.toFixed(1)}s → {item.evidence_end.toFixed(1)}s
                    </span>
                  )}
                </div>

                <div className="text-sm font-medium text-slate-200">
                  {item.message}
                </div>

                {item.evidence_quote && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs italic text-slate-400 font-serif">
                   {item.evidence_quote}
                  </div>
                )}

                {item.suggestion && (
                  <div className="text-xs text-sky-300 font-sans flex items-start gap-2 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item.suggestion}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Transcript with Highlighted Fillers */}
      {transcript && transcript.segments.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Timestamped Transcript</h2>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-4">
            {transcript.segments.map((seg) => (
              <div key={seg.id} className="flex gap-4 items-start text-sm border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                <span className="text-xs font-mono text-slate-500 flex-shrink-0 w-24 pt-0.5">
                  [{seg.start_time.toFixed(1)}s - {seg.end_time.toFixed(1)}s]
                </span>
                <div className="flex-1 leading-relaxed text-slate-300">
                  {seg.words.map((w, wIdx) => (
                    <span key={wIdx}>
                      {w.is_filler ? (
                        <span 
                          className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.5 rounded font-mono text-xs mx-0.5"
                          title="Acoustic / lexical filler token"
                        >
                          {w.word}
                        </span>
                      ) : (
                        ` ${w.word} `
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
