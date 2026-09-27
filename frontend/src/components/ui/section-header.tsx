import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon?: LucideIcon;
  iconColor?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  iconColor = "text-cyan-400",
  kicker,
  title,
  subtitle,
  badge,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-3", className)}>
      <div>
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-1.5 shadow-[0_0_12px_rgba(0,229,255,0.1)]">
              <Icon className={cn("w-4 h-4", iconColor)} />
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              {title}
            </h2>
            {kicker && (
              <p className="text-[10px] text-cyan-400/80 font-mono tracking-wider">
                [{kicker}]
              </p>
            )}
          </div>
        </div>

        {subtitle && (
          <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 self-start md:self-auto">
        {badge}
        {action}
      </div>
    </div>
  );
}
