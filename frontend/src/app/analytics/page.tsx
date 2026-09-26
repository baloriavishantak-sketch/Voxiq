'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Activity, Gauge, AlertTriangle, Pause, Calendar, ChevronRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { getAnalyticsOverview, getAnalyticsTrends } from "@/lib/api";
import { AnalyticsOverview, AnalyticsTrendPoint } from "@/lib/types";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

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
        <Activity className="w-10 h-10 animate-spin text-sky-400 mx-auto" />
        <p className="text-sm text-slate-400">Aggregating historical telemetry across sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Longitudinal Analytics & Baseline</h1>
        <p className="text-sm text-slate-400 mt-1">
          Track genuine historical trends in speaking rate, hesitation density, and acoustic pause distributions.
        </p>
      </div>

      {/* Personal Baseline Stats */}
      {overview && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Total Sessions</span>
              <BarChart3 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white mt-1">
              {overview.total_sessions}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              {overview.total_speech_minutes} min speech logged
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Personal Baseline WPM</span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white mt-1">
              {overview.personal_baseline.mean_wpm} <span className="text-sm font-normal text-slate-400">WPM</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              rolling active speech average
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Mean Filler Density</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white mt-1">
              {overview.personal_baseline.mean_filler_density_pct}%
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              historical token ratio
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Mean Pause Duration</span>
              <Pause className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white mt-1">
              {overview.personal_baseline.mean_pause_seconds}s
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              pauses &gt; 0.5 seconds
            </div>
          </div>
        </section>
      )}

      {/* Historical Speaking Rate Trend Chart */}
      {trends.length > 1 && (
        <section className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Speaking Rate Evolution Across Sessions</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Chronological WPM measurements per completed session.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="title" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="wpm" 
                  name="Speaking Rate (WPM)" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}
