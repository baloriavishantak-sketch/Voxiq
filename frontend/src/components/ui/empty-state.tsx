import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "py-16 text-center rounded-xl border border-dashed border-white/[0.08] p-8 space-y-4",
        className
      )}
    >
      <div className="mx-auto w-12 h-12 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-300">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
