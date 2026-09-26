import Link from "next/link";
import { Mic, HelpCircle, Activity, ShieldCheck, Database, Layers, ArrowRight, Gauge } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 border-b border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-mono mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Scientifically Defensible · Real Telemetry</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Measure How You Communicate, <br />
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Not Just What You Say.
          </span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl mx-auto">
          VOXIQ decouples spoken communication into measurable acoustic pacing, hesitation distributions, 
          sentence complexity, semantic coherence, and evidence-backed recommendations.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/record"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:opacity-95 transition"
          >
            <Mic className="w-5 h-5" />
            <span>Start Practice Session</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link
            href="/interview"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white font-medium border border-slate-700 transition"
          >
            <HelpCircle className="w-5 h-5 text-sky-400" />
            <span>Interview Mode</span>
          </Link>
        </div>
      </section>

      {/* The 3 Analytical Layers */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight">Three Strict Analytical Layers</h2>
          <p className="text-sm text-slate-400 mt-2">Zero hallucinations. Every metric originates from acoustic signal processing or semantic models.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Gauge className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">Layer 1</div>
            <h3 className="text-lg font-semibold text-white">Deterministic Engine</h3>
            <p className="text-xs text-slate-400 mt-2">
              Strict mathematical formulas without LLM dependencies.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
              <li>✓ Active WPM & Gross WPM</li>
<li>✓ Acoustic pause detection &gt; 0.5s</li>
<li>✓ Configurable filler word density</li>
<li>✓ Lexical n-gram repetition & TTR</li>
<li>✓ Sentence length distributions</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-1">Layer 2</div>
            <h3 className="text-lg font-semibold text-white">ML & Semantic NLP</h3>
            <p className="text-xs text-slate-400 mt-2">
              Dense vector embeddings and semantic similarity modeling.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
              <li>✓ 384-dim Sentence-Transformers</li>
<li>✓ Contiguous statement coherence</li>
<li>✓ Topic boundary shift detection</li>
<li>✓ Semantic drift magnitude</li>
<li>✓ Question-to-answer relevance</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-1">Layer 3</div>
            <h3 className="text-lg font-semibold text-white">Evidence-Linked Reasoning</h3>
            <p className="text-xs text-slate-400 mt-2">
              Actionable recommendations strictly anchored to acoustic timestamps.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
              <li>✓ Timestamp-traceable feedback</li>
<li>✓ Pacing shift acceleration flags</li>
<li>✓ Rubric-based interview scoring</li>
<li>✓ Zero subjective trait scoring</li>
<li>✓ Graceful offline degradation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Scientific Principles Section */}
      <section className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
          <Database className="w-5 h-5 text-indigo-400" />
          <span>Scientific Boundaries & Governance</span>
        </h3>
        <p className="text-sm text-slate-400 mt-2">
          VOXIQ never claims to objectively detect personality, truthfulness, intelligence, or psychological traits from voice.
          All observations are classified strictly under defensible linguistic and acoustic dimensions (e.g. speech fluency, pacing dynamics, 
          hesitation patterns, and semantic coherence).
        </p>
      </section>
    </div>
  );
}
