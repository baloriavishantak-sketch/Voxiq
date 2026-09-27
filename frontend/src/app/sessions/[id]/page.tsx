'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, Activity, Gauge, Pause, AlertTriangle,
  Sparkles, Layers, CheckCircle2, FileText, ChevronRight, Binary
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import {
  getSession, getSessionMetrics, getSessionTimeline,
  getSessionTranscript, getSessionFeedback
} from "@/lib/api";
import {
  Session, SummaryMetrics, TimelineData, FullTranscript, FeedbackData
} from "@/lib/types";
import { MetricCard, CompactMetric } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChartCard } from "@/components/ui/chart-card";
import { EvidenceBlock } from "@/components/ui/evidence-block";
import { cn } from "@/lib/utils";

const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

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
        <Activity className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
        <p className="text-xs font-mono text-slate-500">AGGREGATING_SESSION_DOSSIER...</p>
      </div>
    );
  }

  if (error || !session || !metrics) {
    return (
      <div className="p-8 text-center space-y-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
        <p className="text-rose-400 text-sm font-mono">{error || "SESSION_NOT_FOUND"}</p>
        <Link 
          href="/sessions" 
          className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline text-xs font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN_TO_ARCHIVE</span>
        </Link>
      </div>
    );
  }

  const speechRatio = session.duration_seconds > 0 
    ? (session.speech_duration_seconds / session.duration_seconds) * 100 
    : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Dossier Header */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-4">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Link
                href="/sessions"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>ARCHIVE</span>
              </Link>
              <span className="text-slate-700">/</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.2 rounded">
                INTELLIGENCE_DOSSIER
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {session.title}
              </h1>
              <StatusBadge variant={session.mode === "interview" ? "violet" : "cyan"}>
                {session.mode}
              </StatusBadge>
            </div>
          </div>

          {/* Time & Duration Telemetry Badge */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-[#060913] px-4 py-2 rounded-xl border border-white/[0.08] tabular-nums self-start md:self-auto">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Total: {session.duration_seconds.toFixed(1)}s
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              Speech: {session.speech_duration_seconds.toFixed(1)}s ({speechRatio.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Layer 1 & 2 Core Measurement Telemetry Grid */}
      <section className="space-y-4">
        <SectionHeader
          icon={Gauge}
          iconColor="text-cyan-400"
          title="Primary Communication Telemetry"
          kicker="LAYERS_01_AND_02"
          subtitle="Deterministic acoustic signal extraction and sentence-level vector semantic coherence."
        />

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          <MetricCard
            kicker="FLUENCY_RATE"
            label="Speaking Rate"
            value={metrics.wpm.toFixed(1)}
            unit="WPM"
            subtitle="words / (speech_sec / 60)"
            benchmark="130-160 WPM"
            icon={Gauge}
            accentColor="emerald"
          />
          <MetricCard
            kicker="DISFLUENCY_DENSITY"
            label="Filler Density"
            value={metrics.filler_density.toFixed(1)}
            unit="%"
            subtitle="hesitation tokens"
            secondaryValue={`${metrics.filler_count} detected`}
            icon={AlertTriangle}
            accentColor="amber"
          />
          <MetricCard
            kicker="SILENCE_PROFILE"
            label="Acoustic Pauses"
            value={metrics.average_pause_seconds.toFixed(2)}
            unit="sec"
            subtitle="pauses > 0.5s duration"
            secondaryValue={`${metrics.pause_count} total`}
            icon={Pause}
            accentColor="sky"
          />
          <MetricCard
            kicker="VECTOR_COHERENCE"
            label="Semantic Coherence"
            value={
              metrics.semantic_coherence_avg !== null
                ? metrics.semantic_coherence_avg.toFixed(2)
                : "N/A"
            }
            unit="/ 1.0"
            subtitle="sentence cosine similarity"
            benchmark="> 0.65 Target"
            icon={Layers}
            accentColor="violet"
          />
        </div>

        {/* Secondary Linguistic Metrics Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CompactMetric
            label="Lexical Repetition"
            value={`${metrics.repetition_rate.toFixed(1)}%`}
            subtext="Repeated n-gram frequency"
          />
          <CompactMetric
            label="Vocabulary Diversity (TTR)"
            value={metrics.type_token_ratio.toFixed(3)}
            subtext="Unique to total token ratio"
          />
          <CompactMetric
            label="Parsed Sentences"
            value={metrics.sentence_count}
            subtext="Syntactic sentence units"
          />
          <CompactMetric
            label="Mean Sentence Length"
            value={metrics.avg_sentence_length_words.toFixed(1)}
            unit="words"
            subtext="Syntactic complexity"
          />
        </div>
      </section>

      {/* Temporal Dynamics Lab (Pacing Timeline) */}
      {timeline && timeline.windows.length > 0 && (
        <ChartCard
          title="Temporal Pacing & Speech Dynamics"
          subtitle="TIMELINE_WINDOWED_WPM"
          icon={
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-1.5 shadow-[0_0_12px_rgba(0,229,255,0.1)]">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
          }
          badge={
            <div className="flex items-center gap-2">
              <StatusBadge variant="cyan" dot>
                WPM_PACE
              </StatusBadge>
              <span className="text-[10px] font-mono text-slate-500">
                {speechWindows.length} speech windows ({timeline.window_size_seconds}s)
              </span>
            </div>
          }
          footer={
            <>
              <span className="text-[10px] font-mono text-slate-500">
                X: elapsed session time (sec) · Y: windowed words per minute
              </span>
              <span className="text-[10px] font-mono text-cyan-400/80">
                VAD speech-bearing windows only
              </span>
            </>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={speechWindows}
                margin={{ top: 12, right: 12, left: -10, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="pacingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 5"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="window_start"
                  tickFormatter={(val) => `${val}s`}
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, "auto"]}
                  width={38}
                  fontFamily="monospace"
                />
                <Tooltip
                  cursor={{ stroke: "rgba(0, 229, 255, 0.3)", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "#060913",
                    borderColor: "rgba(56, 189, 248, 0.25)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                  itemStyle={{ color: "#00e5ff" }}
                  labelFormatter={(value) =>
                    `Window: ${value}s - ${Number(value) + timeline.window_size_seconds}s`
                  }
                  formatter={(value) => [
                    `${Number(value).toFixed(1)} WPM`,
                    "Speaking Rate",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="wpm"
                  name="Speaking Rate"
                  stroke="#00e5ff"
                  strokeWidth={2}
                  fill="url(#pacingGradient)"
                  fillOpacity={1}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#060913",
                    fill: "#00e5ff",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Word-Level Timestamped Transcript Inspector */}
      {transcript && transcript.segments.length > 0 && (
        <section className="rounded-xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-md overflow-hidden shadow-lg space-y-0">
          <div className="border-b border-white/[0.05] bg-[#0d1424]/60 px-6 py-4 flex items-center justify-between gap-4">
            <SectionHeader
              icon={FileText}
              iconColor="text-cyan-400"
              title="Acoustic Transcript Inspector"
              subtitle="Word-level timecodes and speech disfluency token highlighting from Faster-Whisper."
            />
            <div className="rounded-lg border border-white/[0.08] bg-[#060913] px-3 py-1.5 text-right font-mono">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">SEGMENTS</span>
              <span className="text-xs font-semibold text-cyan-300 tabular-nums">
                {transcript.segments.length}
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {transcript.segments.map((segment) => (
              <div
                key={segment.id}
                className="px-6 py-4 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex gap-4">
                  <div className="w-16 shrink-0 pt-0.5">
                    <div className="font-mono text-xs text-cyan-400 tabular-nums">
                      {formatDuration(segment.start_time)}
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono tabular-nums">
                      {formatDuration(segment.end_time)}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                      {segment.words.length > 0
                        ? segment.words.map((word) => (
                            <span
                              key={word.id}
                              className={
                                word.is_filler
                                  ? "rounded bg-amber-400/15 text-amber-300 px-1 py-0.2 ring-1 ring-inset ring-amber-400/30 font-medium"
                                  : ""
                              }
                              title={
                                word.is_filler
                                  ? `Filler token • ${word.start_time.toFixed(2)}s`
                                  : `${word.start_time.toFixed(2)}s`
                              }
                            >
                              {word.word}{" "}
                            </span>
                          ))
                        : segment.text}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                      <span>{segment.words.length} words</span>
                      <span>·</span>
                      <span>{Math.max(0, segment.end_time - segment.start_time).toFixed(1)}s segment</span>
                      <span>·</span>
                      <span>STT {(segment.confidence * 100).toFixed(0)}%</span>
                      {segment.words.some((w) => w.is_filler) && (
                        <>
                          <span>·</span>
                          <span className="text-amber-400 font-semibold">FILLER_DETECTED</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Layer 3 Evidence-Backed Feedback Dossier */}
      {feedback && feedback.items.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            icon={Sparkles}
            iconColor="text-violet-400"
            title="Evidence-Backed Communication Coaching"
            kicker="LAYER_03_REASONING"
            subtitle="Recommendations are strictly anchored to measured communication telemetry and linked to verbatim quotes from the session."
            badge={
              <StatusBadge variant="violet" dot>
                {feedback.items.length} INSIGHTS
              </StatusBadge>
            }
          />

          <div className="grid grid-cols-1 gap-3.5">
            {feedback.items.map((item, index) => (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b1120]/90 p-5 sm:p-6 backdrop-blur-md transition-all duration-200 hover:border-violet-500/30 shadow-lg"
              >
                {/* Left violet accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-violet-400 to-transparent" />

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-violet-500/30 bg-violet-950/40 text-[10px] font-mono text-violet-300 font-bold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <StatusBadge variant="violet">{item.category}</StatusBadge>
                    </div>

                    {item.evidence_start !== undefined && item.evidence_end !== undefined && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-[#060913] px-2.5 py-1 rounded border border-white/[0.06] tabular-nums self-start sm:self-auto">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {item.evidence_start.toFixed(1)}s → {item.evidence_end.toFixed(1)}s
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-100">
                    {item.message}
                  </p>

                  {/* Evidence quote */}
                  {item.evidence_quote && (
                    <EvidenceBlock quote={item.evidence_quote} sourceLabel="TRANSCRIPT_PROOF" />
                  )}

                  {/* Recommendation action box */}
                  {item.suggestion && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-950/30 px-3.5 py-2.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block mb-0.5">
                          RECOMMENDED_ACTION:
                        </span>
                        <p className="text-slate-300 leading-relaxed">{item.suggestion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}