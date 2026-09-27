import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { Cpu, ShieldCheck, Terminal, Layers } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "VOXIQ · Multimodal Communication Intelligence",
  description: "Evidence-backed acoustic, linguistic, and semantic communication telemetry platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060913] text-slate-100 flex flex-col antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        {/* Ambient atmospheric lighting */}
        <div className="fixed inset-0 bg-radial-atmosphere pointer-events-none -z-10" />
        <div className="fixed inset-0 bg-grid pointer-events-none -z-10 opacity-70" />

        <NavBar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          {children}
        </main>

        {/* Technical Terminal Footer */}
        <footer className="border-t border-white/[0.06] bg-[#060913]/95 py-5 text-[11px] font-mono text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>VOXIQ_SYSTEM_v1.0.0</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="hidden sm:inline text-slate-500">
                FASTER-WHISPER + SENTENCE-TRANSFORMERS (ALL-MINILM-L6-V2)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[10px]">
              <div className="flex items-center gap-1.5 text-cyan-400/90 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>ZERO_CLOUD_TELEMETRY</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span>STRICT_3_LAYER_SEPARATION</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
