'use client';

import { cn } from "@/lib/utils";

interface AudioLevelMeterProps {
  level: number; // 0 to 1
  className?: string;
  bars?: number;
  height?: number;
  showVUHeadroom?: boolean;
}

export function AudioLevelMeter({
  level,
  className,
  bars = 24,
  height = 36,
  showVUHeadroom = true,
}: AudioLevelMeterProps) {
  // Clamped RMS level
  const clamped = Math.max(0, Math.min(1, level));

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {/* Multi-bar acoustic spectrum visualizer */}
      <div 
        className="flex items-end justify-center gap-1 px-3 py-2 rounded-xl bg-[#060913]/80 border border-white/[0.08]"
        style={{ height: `${height + 16}px` }}
      >
        {Array.from({ length: bars }).map((_, i) => {
          // Calculate an organic height based on bar position and RMS level
          const centerDist = Math.abs(i - bars / 2) / (bars / 2);
          const damping = 1 - Math.pow(centerDist, 1.5) * 0.5;
          const noise = ((i * 17) % 7) / 10;
          const barHeight = Math.max(
            8,
            Math.min(100, clamped * 120 * damping + (clamped > 0.05 ? noise * 15 : 0))
          );

          // Color gradient from cyan through sky to amber if near peak
          const isHigh = barHeight > 75;
          const isMid = barHeight > 45;

          return (
            <div
              key={i}
              className={cn(
                "w-1.5 rounded-full transition-all duration-75",
                isHigh
                  ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  : isMid
                  ? "bg-cyan-400 shadow-[0_0_6px_rgba(0,229,255,0.4)]"
                  : "bg-sky-500/60"
              )}
              style={{
                height: `${clamped > 0.01 ? barHeight : 6}%`,
              }}
            />
          );
        })}
      </div>

      {/* Studio VU headroom readout */}
      {showVUHeadroom && (
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
          <span className="flex items-center gap-1.5">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              clamped > 0.02 ? "bg-cyan-400 animate-pulse" : "bg-slate-600"
            )} />
            MIC_RMS: {(clamped * 100).toFixed(0)}%
          </span>
          <span className="text-slate-600">PEAK_HEADROOM: {clamped > 0.85 ? "CLIPPING_RISK" : "NOMINAL"}</span>
          <span>16.0 kHz</span>
        </div>
      )}
    </div>
  );
}
