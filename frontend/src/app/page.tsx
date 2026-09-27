import Link from "next/link";
import { 
  Mic, HelpCircle, Activity, ShieldCheck, Database, Layers, ArrowRight, 
  Gauge, Terminal, Zap, Binary, Sparkles, CheckCircle2, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* 65/35 Asymmetrical AI Intelligence Command Center Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-4 pb-2">
        {/* Left Hero Cockpit (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0b1120]/80 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          {/* Subtle top cyan line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-500 to-transparent" />
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-[11px] font-mono uppercase tracking-[0.1em]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
              <span>MULTIMODAL_TELEMETRY_ENGINE // v1.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Measure How You Speak, <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                Not Just What You Say.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              VOXIQ replaces subjective impressions with defensible telemetry. It decouples verbal communication into deterministic acoustic pacing, hesitation distributions, dense vector coherence, and evidence-backed coaching.
            </p>
          </div>

          {/* Live Simulated Acoustic Spectrum HUD */}
          <div className="my-6 p-4 rounded-xl bg-[#060913]/90 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Activity className="w-3 h-3" />
                <span>ACOUSTIC_SIGNAL_MONITOR</span>
              </span>
              <span className="text-slate-500">16kHz_VAD // DUAL_BUFFER</span>
            </div>

            {/* Spectrum bar simulation */}
            <div className="h-10 flex items-end justify-between gap-1 pt-2">
              {[28, 45, 62, 85, 40, 70, 95, 55, 30, 80, 65, 90, 48, 75, 100, 60, 35, 78, 92, 50, 68, 84, 42, 60].map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-sm bg-gradient-to-t from-cyan-500/20 via-cyan-400/80 to-sky-300 transition-all duration-300"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/record"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>LAUNCH_PRACTICE_BAY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#131d36] hover:bg-[#1a2645] border border-white/[0.1] text-slate-200 font-medium text-xs tracking-wide transition-all"
            >
              <HelpCircle className="w-4 h-4 text-violet-400" />
              <span>INTERVIEW_CONSOLE</span>
            </Link>
          </div>
        </div>

        {/* Right Launchpad Cockpit (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-white/[0.08] bg-[#0b1120]/80 backdrop-blur-xl relative shadow-2xl space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-cyan-400 font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>COMMAND_LAUNCHPAD</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ONLINE
              </span>
            </div>

            {/* Quick action cards */}
            <div className="space-y-3">
              <Link
                href="/record"
                className="group p-3.5 rounded-xl border border-white/[0.06] bg-[#0d1424] hover:border-cyan-500/40 hover:bg-[#131d36] transition-all duration-200 block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        Free Speech Practice
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Capture voice, extract WPM, pauses, and fillers.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              <Link
                href="/interview"
                className="group p-3.5 rounded-xl border border-white/[0.06] bg-[#0d1424] hover:border-violet-500/40 hover:bg-[#131d36] transition-all duration-200 block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors">
                        Arbitrary Question Console
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Enter any prompt for local KeyBERT decomposition.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              <Link
                href="/sessions"
                className="group p-3.5 rounded-xl border border-white/[0.06] bg-[#0d1424] hover:border-sky-500/40 hover:bg-[#131d36] transition-all duration-200 block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform">
                      <Binary className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                        Historical Telemetry Archive
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Review timestamped transcripts and coaching reports.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            </div>
          </div>

          {/* Architecture spec ticker */}
          <div className="p-3 rounded-xl bg-[#060913]/90 border border-white/[0.06] text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span className="text-cyan-400 font-medium">PIPELINE:</span>
            <span>WHISPER + VAD + EMBEDDINGS</span>
            <span className="text-emerald-400">100% LOCAL</span>
          </div>
        </div>
      </section>

      {/* The 3-Layer Deep Intelligence Architecture Explorer */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                SYSTEM_ARCHITECTURE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5">
              Three Strict Analytical Layers
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Zero hallucinated feedback. Every computation is strictly isolated across acoustic signal processing, dense vector semantic modeling, and evidence synthesis.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            SPECIFICATION // v1.0.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Layer 1 Card */}
          <Link
            href="/record"
            className="group p-6 rounded-xl border border-white/[0.08] bg-[#0b1120]/90 hover:border-cyan-500/30 hover:bg-[#0f172a] transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-lg"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Gauge className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  LAYER_01
                </span>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                Deterministic Engine
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Acoustic signal processing & strict linguistic formulas without generative LLM uncertainty.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">01</span>
                  <span>Active WPM vs Gross WPM</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">02</span>
                  <span>Acoustic pause detection (&gt;0.5s)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">03</span>
                  <span>Configurable filler token density</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">04</span>
                  <span>Lexical n-gram repetition & TTR</span>
                </li>
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-cyan-400">
              <span>EXPLORE_PRACTICE</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Layer 2 Card */}
          <Link
            href="/interview"
            className="group p-6 rounded-xl border border-white/[0.08] bg-[#0b1120]/90 hover:border-violet-500/30 hover:bg-[#0f172a] transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-lg"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-400 to-transparent" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
                  LAYER_02
                </span>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors">
                Vector NLP & Embeddings
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Dense semantic similarity and topic progression modeling via 384-dimensional embeddings.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-violet-400">01</span>
                  <span>Sentence-level cosine coherence</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-400">02</span>
                  <span>Topic shift & boundary tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-400">03</span>
                  <span>Question-to-answer alignment</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-400">04</span>
                  <span>KeyBERT + MMR concept clouds</span>
                </li>
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-violet-400">
              <span>EXPLORE_INTERVIEW</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Layer 3 Card */}
          <Link
            href="/sessions"
            className="group p-6 rounded-xl border border-white/[0.08] bg-[#0b1120]/90 hover:border-sky-500/30 hover:bg-[#0f172a] transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-lg"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 to-transparent" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold">
                  LAYER_03
                </span>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors">
                Evidence Synthesis
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Objective recommendations strictly anchored to acoustic timestamps and quoted transcript proof.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">01</span>
                  <span>Timestamp-traceable feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">02</span>
                  <span>Pacing acceleration detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">03</span>
                  <span>Rubric-based interview scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">04</span>
                  <span>Zero subjective trait grading</span>
                </li>
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-sky-400">
              <span>EXPLORE_ARCHIVE</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Operational Boundary & Governance Matrix */}
      <section className="p-6 sm:p-7 rounded-xl border border-white/[0.08] bg-[#0b1120]/80 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-slate-200">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-tight text-white uppercase font-mono">
            Scientific Boundaries & Ethical Governance Matrix
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 leading-relaxed">
          <div className="p-4 rounded-lg bg-[#060913]/70 border border-white/[0.05] space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">
              DEFENSIBLE MEASUREMENTS (SUPPORTED)
            </span>
            <p>
              Acoustic speech fluency, millisecond pause distribution, speech rate acceleration dynamics, lexical richness (Type-Token Ratio), repetitive n-gram density, sentence semantic coherence, and rubric-driven coverage.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[#060913]/70 border border-white/[0.05] space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block">
              PSEUDO-SCIENTIFIC CLAIMS (REJECTED)
            </span>
            <p>
              VOXIQ strictly rejects claims of detecting personality traits, innate intelligence, deception, or emotional authenticity from raw vocal acoustics. All evaluations are anchored exclusively in verifiable communication patterns.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
