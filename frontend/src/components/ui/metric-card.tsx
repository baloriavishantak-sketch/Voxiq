import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type AccentColor = "cyan" | "emerald" | "amber" | "sky" | "indigo" | "violet" | "rose";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  accentColor: AccentColor;
  secondaryValue?: string;
  kicker?: string;
  benchmark?: string;
}

const accentStyles: Record<AccentColor, { border: string; bg: string; text: string; hairline: string; glow: string }> = {
  cyan: {
    border: "hover:border-cyan-400/40",
    bg: "border-cyan-500/20 bg-cyan-950/30",
    text: "text-cyan-400",
    hairline: "from-cyan-400/80 via-cyan-400/20 to-transparent",
    glow: "group-hover:shadow-[0_0_25px_rgba(0,229,255,0.15)]",
  },
  sky: {
    border: "hover:border-sky-500/40",
    bg: "border-sky-500/20 bg-sky-950/30",
    text: "text-sky-400",
    hairline: "from-sky-400/80 via-sky-400/20 to-transparent",
    glow: "group-hover:shadow-[0_0_25px_rgba(56,189,248,0.15)]",
  },
  violet: {
    border: "hover:border-violet-500/40",
    bg: "border-violet-500/20 bg-violet-950/30",
    text: "text-violet-400",
    hairline: "from-violet-400/80 via-violet-400/20 to-transparent",
    glow: "group-hover:shadow-[0_0_25px_rgba(167,139,250,0.15)]",
  },
  indigo: {
    border: "hover:border-indigo-500/40",
    bg: "border-indigo-500/20 bg-indigo-950/30",
    text: "text-indigo-400",
    hairline: "from-indigo-400/80 via-indigo-400/20 to-transparent",
    glow: "group-hover:shadow-[0_0_25px_rgba(129,140,248,0.15)]",
  },
  emerald: {
    border: "hover:border-emerald-500/40",
    bg: "border-emerald-500/20 bg-emerald-950/30",
    text: "text-emerald-400",
    hairline: "from-emerald-400/80 via-emerald-400/20 to-transparent",
    glow: "group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
  },
  amber: {
    border: "hover:border-amber-500/40",
    bg: "border-amber-500/20 bg-amber-950/30",
    text: "text-amber-400",
    hairline: "from-amber-400/80 via-amber-400/20 to-transparent",
    glow: "group-hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]",
  },
  rose: {
    border: "hover:border-rose-500/40",
    bg: "border-rose-500/20 bg-rose-950/30",
    text: "text-rose-400",
    hairline: "from-rose-400/80 via-rose-400/20 to-transparent",
    glow: "group-hover:shadow-[0_0_25px_rgba(251,113,133,0.15)]",
  },
};

export function MetricCard({
  label,
  value,
  unit,
  subtitle,
  icon: Icon,
  accentColor,
  secondaryValue,
  kicker,
  benchmark,
}: MetricCardProps) {
  const styles = accentStyles[accentColor];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b1120]/90 p-5",
        "transition-all duration-200 backdrop-blur-md",
        styles.border,
        styles.glow,
        "hover:bg-[#0f172a]"
      )}
    >
      {/* Precision hairline gradient accent */}
      <div className={cn("absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r", styles.hairline)} />

      <div className="flex items-start justify-between">
        <div>
          {kicker && (
            <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-slate-500 block mb-1">
              {kicker}
            </span>
          )}
          <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-slate-400 font-medium">
            {label}
          </p>
          <div className="mt-2.5 flex items-baseline">
            <span className="text-3xl font-mono font-bold tracking-tight text-white tabular-nums drop-shadow-sm">
              {value}
            </span>
            {unit && (
              <span className="ml-1.5 text-xs font-mono font-normal text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className={cn("rounded-lg border p-2.5 transition-transform group-hover:scale-105", styles.bg)}>
          <Icon className={cn("h-4 w-4", styles.text)} />
        </div>
      </div>

      {(subtitle || secondaryValue || benchmark) && (
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
          {subtitle && (
            <p className="text-[10px] font-mono text-slate-500">{subtitle}</p>
          )}
          {benchmark && (
            <span className="text-[10px] font-mono text-cyan-400/80">
              Ref: {benchmark}
            </span>
          )}
          {secondaryValue && (
            <span className="text-[10px] font-mono text-slate-400">
              {secondaryValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* Compact metric for dense tables and secondary grids */
interface CompactMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
}

export function CompactMetric({ label, value, unit, subtext }: CompactMetricProps) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0b1120]/80 p-3.5 backdrop-blur-sm">
      <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <div className="mt-1.5 flex items-baseline">
        <span className="text-lg font-mono font-semibold text-slate-100 tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="ml-1 text-[11px] font-mono text-slate-400">
            {unit}
          </span>
        )}
      </div>
      {subtext && (
        <p className="mt-1 text-[9px] font-mono text-slate-500">{subtext}</p>
      )}
    </div>
  );
}
