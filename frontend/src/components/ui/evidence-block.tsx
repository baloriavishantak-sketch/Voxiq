import { cn } from "@/lib/utils";
import { Info, Quote } from "lucide-react";

interface EvidenceBlockProps {
  quote: string;
  timestamp?: string;
  sourceLabel?: string;
  className?: string;
}

export function EvidenceBlock({
  quote,
  timestamp,
  sourceLabel = "SESSION_EVIDENCE",
  className,
}: EvidenceBlockProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-cyan-500/20 bg-[#060913]/90 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.05] bg-[#0b1120]/70 px-3.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-cyan-400" />
          <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-cyan-400/90 font-medium">
            {sourceLabel}
          </span>
        </div>
        {timestamp && (
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
            {timestamp}
          </span>
        )}
      </div>
      <div className="px-3.5 py-2.5 flex items-start gap-2.5">
        <Quote className="w-3.5 h-3.5 text-cyan-400/40 flex-shrink-0 mt-0.5" />
        <p className="text-xs sm:text-[13px] italic leading-relaxed text-slate-300">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </div>
  );
}
