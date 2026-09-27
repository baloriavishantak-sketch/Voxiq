import { cn } from "@/lib/utils";

type BadgeVariant =
  | "cyan"
  | "sky"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "slate"
  | "default";

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { border: string; bg: string; text: string; dot: string }> = {
  cyan: {
    border: "border-cyan-400/30",
    bg: "bg-cyan-950/40",
    text: "text-cyan-300",
    dot: "bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)]",
  },
  sky: {
    border: "border-sky-500/30",
    bg: "bg-sky-950/40",
    text: "text-sky-300",
    dot: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]",
  },
  violet: {
    border: "border-violet-500/30",
    bg: "bg-violet-950/40",
    text: "text-violet-300",
    dot: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]",
  },
  emerald: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
  },
  rose: {
    border: "border-rose-500/30",
    bg: "bg-rose-950/40",
    text: "text-rose-300",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
  },
  slate: {
    border: "border-white/10",
    bg: "bg-white/[0.04]",
    text: "text-slate-400",
    dot: "bg-slate-400",
  },
  default: {
    border: "border-white/10",
    bg: "bg-white/[0.04]",
    text: "text-slate-300",
    dot: "bg-slate-300",
  },
};

export function StatusBadge({
  variant = "default",
  children,
  className,
  dot,
}: StatusBadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5",
        "text-[10px] font-mono uppercase tracking-wider font-medium backdrop-blur-sm",
        styles.border,
        styles.bg,
        styles.text,
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", styles.dot)} />}
      {children}
    </span>
  );
}
