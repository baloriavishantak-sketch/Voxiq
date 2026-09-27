import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  kicker?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  description,
  kicker,
  action,
  className,
}: PageHeaderProps) {
  const subText = subtitle ?? description;
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.06] pb-6", className)}>
      <div className="space-y-1.5">
        {kicker && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
              {kicker}
            </span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {subText && (
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            {subText}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0 self-start sm:self-auto">{action}</div>}
    </div>
  );
}
