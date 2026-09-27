'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  History, Calendar, Clock, ChevronRight, Trash2, Loader2, ArrowRight, 
  Search, Filter, Activity, Gauge, AlertTriangle, Layers, BarChart3, Plus
} from "lucide-react";
import { listSessions, deleteSession } from "@/lib/api";
import { Session } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { cn } from "@/lib/utils";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<"all" | "practice" | "interview">("all");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await listSessions();
      setSessions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Compute live archive statistics from sessions
  const stats = useMemo(() => {
    const total = sessions.length;
    const totalSpeechSec = sessions.reduce((acc, s) => acc + (s.speech_duration_seconds || 0), 0);
    const totalDurationSec = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
    const practiceCount = sessions.filter((s) => s.mode === "practice").length;
    const interviewCount = sessions.filter((s) => s.mode === "interview").length;
    const speechRatio = totalDurationSec > 0 ? (totalSpeechSec / totalDurationSec) * 100 : 0;

    return {
      total,
      speechMinutes: (totalSpeechSec / 60).toFixed(1),
      practiceCount,
      interviewCount,
      speechRatio: speechRatio.toFixed(0),
    };
  }, [sessions]);

  // Filtered session list
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = selectedMode === "all" || s.mode === selectedMode;
      return matchesSearch && matchesMode;
    });
  }, [sessions, searchQuery, selectedMode]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <PageHeader 
        kicker="DATA_ARCHIVE"
        title="Session Telemetry Archive" 
        subtitle="Chronological repository of all speech recordings, acoustic transcripts, and evidence dossiers."
        action={
          <Link
            href="/record"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs font-mono shadow-[0_0_15px_rgba(0,229,255,0.3)] transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW_SESSION</span>
          </Link>
        }
      />

      {/* Archive KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
            <span>TOTAL_RECORDINGS</span>
            <History className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2 tabular-nums">
            {stats.total}
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">
            {stats.practiceCount} practice · {stats.interviewCount} interview
          </span>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
            <span>LOGGED_SPEECH_TIME</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2 tabular-nums">
            {stats.speechMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">
            VAD active speech duration
          </span>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
            <span>ACTIVE_SPEECH_RATIO</span>
            <Activity className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2 tabular-nums">
            {stats.speechRatio}%
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">
            Speech vs silence efficiency
          </span>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
            <span>TELEMETRY_PIPELINE</span>
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-300 mt-2">
            3-LAYER
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">
            Signal + NLP + Reasoning
          </span>
        </div>
      </div>

      {/* Filter & Search Command Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-xl bg-[#0b1120] border border-white/[0.08]">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter sessions by title..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#060913] border border-white/[0.08] text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Mode filter pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#060913] border border-white/[0.06] self-stretch sm:self-auto justify-center">
          {(["all", "practice", "interview"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMode(m)}
              className={cn(
                "px-3 py-1 rounded-md text-[11px] font-mono uppercase font-medium transition-all",
                selectedMode === m
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Session Archive Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-xs font-mono text-slate-500">RETRIEVING_TELEMETRY_LOGS...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          icon={History}
          title={searchQuery ? "No matching sessions found" : "No sessions recorded yet"}
          description={
            searchQuery
              ? `No sessions match "${searchQuery}". Clear your search query to see all sessions.`
              : "Record a practice speech or take an interview to generate your first communication intelligence dossier."
          }
          action={
            <Link
              href="/record"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-semibold transition"
            >
              <span>INITIALIZE_RECORDING</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredSessions.map((sess) => {
            const speechRatio = sess.duration_seconds > 0 
              ? (sess.speech_duration_seconds / sess.duration_seconds) * 100 
              : 0;

            return (
              <div
                key={sess.id}
                className={cn(
                  "p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group",
                  "bg-[#0b1120]/90 border border-white/[0.08] hover:border-cyan-500/40 hover:bg-[#0f172a] transition-all duration-200 shadow-md backdrop-blur-md"
                )}
              >
                <Link href={`/sessions/${sess.id}`} className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                      {sess.title}
                    </h3>
                    <StatusBadge variant={sess.mode === "interview" ? "violet" : "cyan"}>
                      {sess.mode}
                    </StatusBadge>
                    <StatusBadge variant={sess.status === "completed" ? "emerald" : "amber"}>
                      {sess.status}
                    </StatusBadge>
                  </div>

                  {/* Metadata and Speech Duration Ratio Bar */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 tabular-nums">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(sess.created_at).toLocaleDateString()} {new Date(sess.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{sess.duration_seconds.toFixed(1)}s total</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-emerald-400">{sess.speech_duration_seconds.toFixed(1)}s speech</span>
                    </span>

                    {/* Mini speech ratio progress bar */}
                    <div className="hidden md:flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#060913] rounded-full overflow-hidden border border-white/[0.05]">
                        <div 
                          className="h-full bg-cyan-400/80 rounded-full" 
                          style={{ width: `${Math.min(100, speechRatio)}%` }} 
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{speechRatio.toFixed(0)}%</span>
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteTarget(sess.id);
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete session"
                    aria-label="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/sessions/${sess.id}`}
                    className="p-2 rounded-lg text-slate-500 group-hover:text-cyan-300 group-hover:bg-cyan-500/10 transition"
                    aria-label="View session dossier"
                  >
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        isOpen={!!deleteTarget} 
        onCancel={() => setDeleteTarget(null)} 
        onConfirm={async () => { 
          if (!deleteTarget) return;
          try {
            await deleteSession(deleteTarget); 
            setSessions(prev => prev.filter(s => s.id !== deleteTarget)); 
          } catch (err) {
            console.error("Failed to delete session", err);
          } finally {
            setDeleteTarget(null); 
          }
        }} 
      />
    </div>
  );
}
