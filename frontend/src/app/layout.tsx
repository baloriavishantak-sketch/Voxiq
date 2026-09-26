import type { Metadata } from "next";
import Link from "next/link";
import { Mic, BarChart3, HelpCircle, History, Sparkles } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
 title: "VOXIQ · Multimodal Communication Intelligence",
  description: "Evidence-backed acoustic, linguistic, and semantic communication analysis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
        {/* Navigation Bar */}
        <header className="border-b border-slate-800 bg-[#0d1527]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
                  VOXIQ
                </span>
                <span className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  Communication Intelligence
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/record"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Practice</span>
              </Link>
              <Link
                href="/interview"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>Interview</span>
              </Link>
              <Link
                href="/sessions"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <History className="w-4 h-4 text-amber-400" />
                <span>Sessions</span>
              </Link>
              <Link
                href="/analytics"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Analytics</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-[#070b14] py-6 text-center text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>VOXIQ v1.0.0 · Scientifically defensible communication analytics</span>
            <span>Zero hallucinated metrics · Strict 3-Layer separation</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
