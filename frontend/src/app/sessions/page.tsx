'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Calendar, Clock, ChevronRight, Trash2, Loader2, ArrowRight } from "lucide-react";
import { listSessions, deleteSession } from "@/lib/api";
import { Session } from "@/lib/types";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete session");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Session History</h1>
          <p className="text-sm text-slate-400 mt-1">Review past communication analysis sessions.</p>
        </div>
        <Link
          href="/record"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition"
        >
          New Practice Session
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-sm">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 p-8 space-y-4">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No sessions recorded yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Record a practice answer or take an interview to generate your first communication profile.
          </p>
          <Link
            href="/record"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500"
          >
            <span>Start Practice</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((sess) => (
            <Link
              key={sess.id}
              href={`/sessions/${sess.id}`}
              className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                    {sess.title}
                  </h3>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                      sess.mode === "interview"
                        ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {sess.mode}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                      sess.status === "completed"
                        ? "border-slate-700 bg-slate-800 text-slate-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {sess.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(sess.created_at).toLocaleDateString()} {new Date(sess.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {sess.duration_seconds.toFixed(1)}s total → {sess.speech_duration_seconds.toFixed(1)}s active speech
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleDelete(sess.id, e)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
