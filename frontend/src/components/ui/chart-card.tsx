import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  icon,
  badge,
  footer,
  children,
  className,
}: ChartCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#0b1120]/90 backdrop-blur-md overflow-hidden shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.05] bg-[#0d1424]/60">
        <div>
          <div className="flex items-center gap-2.5">
            {icon}
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white">{title}</h2>
              {subtitle && (
                <p className="text-[10px] text-cyan-400/80 mt-0.5 font-mono tracking-wider">
                  [{subtitle}]
                </p>
              )}
            </div>
          </div>
        </div>
        {badge && (
          <div className="flex items-center gap-2 self-start md:self-center">
            {badge}
          </div>
        )}
      </div>

      {/* Chart content */}
      <div className="px-4 sm:px-6 pt-5 pb-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-3 border-t border-white/[0.05] bg-[#060913]/40">
          {footer}
        </div>
      )}
    </section>
  );
}
