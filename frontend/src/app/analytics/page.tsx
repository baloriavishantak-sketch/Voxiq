'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3, Activity, Gauge, AlertTriangle, Pause, TrendingUp,
  Clock, Sparkles, Layers, ArrowRight, ShieldCheck, Compass
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart
} from "recharts";
import { getAnalyticsOverview, getAnalyticsTrends } from "@/lib/api";
import { AnalyticsOverview, AnalyticsTrendPoint } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard, CompactMetric } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrend, setActiveTrend] = useState<"wpm" | "filler" | "coherence">("wpm");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [ovData, trData] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsTrends(),
        ]);
        setOverview(ovData);
        setTrends(trData.trends);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Activity className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
        <p className="text-xs font-mono text-slate-500">AGGREGATING_HISTORICAL_TELEMETRY...</p>
      </div>
    );
  }

  const trendConfig = {
    wpm: { 
      key: "wpm", 
      name: "Speaking Rate (WPM)", 
      color: "#00e5ff", 
      label: "SPEAKING_RATE", 
      unit: "WPM",
      benchmark: "Target: 130-160"
    },
    filler: { 
      key: "filler_density", 
      name: "Filler Density (%)", 
      color: "#f59e0b", 
      label: "FILLER_DENSITY", 
      unit: "%",
      benchmark: "Target: < 3.0%"
    },
    coherence: { 
      key: "coherence", 
      name: "Semantic Coherence", 
      color: "#818cf8", 
      label: "COHERENCE", 
      unit: "/ 1.0",
      benchmark: "Target: > 0.65"
    },
  };
  const currentTrend = trendConfig[activeTrend];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <PageHeader
        kicker="LONGITUDINAL_LAB"
        title="Communication Analytics & Personal Baseline"
        subtitle="Track genuine historical trends in speaking fluency, hesitation density, acoustic silence patterns, and semantic coherence across all recorded sessions."
      />

      {/* Personal Baseline Stats Matrix */}
      {overview && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-400 font-semibold">
              PERSONAL_BASELINE_TELEMETRY
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              AGGREGATED OVER {overview.total_sessions} SESSIONS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <MetricCard
              kicker="CUMULATIVE_VOLUME"
              label="Total Speech Volume"
              value={overview.total_speech_minutes}
              unit="min"
              subtitle={`${overview.total_sessions} completed sessions`}
              icon={BarChart3}
              accentColor="cyan"
            />
            <MetricCard
              kicker="ROLLING_PACE"
              label="Personal Baseline WPM"
              value={overview.personal_baseline.mean_wpm}
              unit="WPM"
              benchmark="130-160 WPM"
              subtitle="active speech average"
              icon={Gauge}
              accentColor="emerald"
            />
            <MetricCard
              kicker="DISFLUENCY_RATIO"
              label="Mean Filler Density"
              value={`${overview.personal_baseline.mean_filler_density_pct}%`}
              benchmark="< 3.0% Ideal"
              subtitle="historical token ratio"
              icon={AlertTriangle}
              accentColor="amber"
            />
            <MetricCard
              kicker="ACOUSTIC_SILENCE"
              label="Mean Pause Duration"
              value={`${overview.personal_baseline.mean_pause_seconds}s`}
              subtitle="pauses > 0.5s duration"
              icon={Pause}
              accentColor="sky"
            />
          </div>
        </section>
      )}

      {/* Longitudinal Trend Engine */}
      {trends.length > 1 ? (
        <ChartCard
          title="Longitudinal Telemetry Trend Engine"
          subtitle="SESSION_OVER_TIME"
          icon={
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-1.5 shadow-[0_0_12px_rgba(0,229,255,0.1)]">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
          }
          badge={
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#060913] border border-white/[0.08]">
              {(["wpm", "filler", "coherence"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTrend(t)}
                  className={cn(
                    "px-3 py-1 rounded text-[10px] font-mono font-medium transition-all",
                    activeTrend === t
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {trendConfig[t].label}
                </button>
              ))}
            </div>
          }
          footer={
            <>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                <span>X: Chronological Session Title</span>
                <span>·</span>
                <span className="text-cyan-400/90">{currentTrend.benchmark}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {trends.length} sessions logged
              </span>
            </>
          }
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trends}
                margin={{ top: 10, right: 12, left: -10, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentTrend.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={currentTrend.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 5"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="title"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="monospace"
                  tickFormatter={(val: string) =>
                    val.length > 14 ? val.substring(0, 14) + "…" : val
                  }
                  dy={8}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="monospace"
                  domain={[0, "auto"]}
                  width={38}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "#060913",
                    borderColor: "rgba(56, 189, 248, 0.25)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                  itemStyle={{ color: currentTrend.color }}
                  formatter={(val) => [
                    `${Number(val).toFixed(2)} ${currentTrend.unit}`,
                    currentTrend.name,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={currentTrend.key}
                  name={currentTrend.name}
                  stroke={currentTrend.color}
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                  fillOpacity={1}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#060913",
                    fill: currentTrend.color,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="Insufficient Data for Longitudinal Trends"
          description="Complete at least 2 sessions to generate multi-session trend trajectories across speaking rate, filler density, and semantic coherence."
          action={
            <Link
              href="/record"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-semibold transition"
            >
              <span>INITIALIZE_SECOND_SESSION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      )}

      {/* Stability & Scientific Integrity Breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0b1120]/80 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold uppercase">
            <Compass className="w-4 h-4" />
            <span>Pacing Stability Analysis</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consistent pacing between 130 and 160 WPM maximizes comprehension in technical discussions. Large oscillations in pacing typically indicate cognitive retrieval effort or unscripted hesitation.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0b1120]/80 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono font-semibold uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Vector Semantic Trajectory</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Semantic coherence is computed by calculating cosine similarity across contiguous sentence embeddings via all-MiniLM-L6-v2. Scores above 0.65 indicate coherent thematic progression.
          </p>
        </div>
      </section>
    </div>
  );
}
