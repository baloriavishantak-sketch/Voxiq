"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, HelpCircle, History, BarChart3, Activity, Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/record", label: "Practice", icon: Mic, color: "text-cyan-400", indicator: "via-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)]" },
  { href: "/interview", label: "Interview", icon: HelpCircle, color: "text-violet-400", indicator: "via-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" },
  { href: "/sessions", label: "History", icon: History, color: "text-sky-400", indicator: "via-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, color: "text-indigo-400", indicator: "via-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" },
];

export function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-14 bg-[#060913]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Left: Brand + Engine Status Beacon */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.35)] group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-none">
                VOXIQ
              </span>
              <span className="text-[8px] font-mono tracking-[0.14em] text-cyan-400 uppercase font-semibold mt-0.5">
                INTEL_v1.0
              </span>
            </div>
          </Link>

          {/* Engine Status Beacon Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1120] border border-cyan-500/20 text-[10px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,229,255,0.8)] animate-pulse" />
            <span className="text-cyan-300 font-medium">LOCAL_ENGINE</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">16kHz_VAD</span>
          </div>
        </div>

        {/* Center: Refined Transparent Nav with Thin Bottom Indicator */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium transition-all duration-150 rounded-md",
                  isActive
                    ? "text-white bg-white/[0.04] shadow-[0_0_20px_rgba(0,229,255,0.06)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                )}
              >
                <item.icon className={cn("w-3.5 h-3.5 transition-colors", isActive ? item.color : "text-slate-500")} />
                <span>{item.label}</span>
                {isActive && (
                  <span 
                    className={cn(
                      "absolute bottom-0 inset-x-2.5 h-[2px] rounded-full bg-gradient-to-r from-transparent to-transparent",
                      item.indicator
                    )} 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Quick Launchpad Button & Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/record"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all active:scale-95"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>RECORD_BAY</span>
            <ArrowUpRight className="w-3 h-3 text-cyan-400/80" />
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="p-1.5 rounded-md text-slate-400 hover:text-white bg-[#0b1120] border border-white/[0.08]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-[#060913]/95 border-b border-white/[0.08] backdrop-blur-2xl p-4 shadow-2xl animate-fade-in">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors",
                    isActive
                      ? "bg-[#0f172a] text-white border border-cyan-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={cn("w-4 h-4", isActive ? item.color : "text-slate-500")} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
