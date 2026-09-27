'use client';

import { cn } from "@/lib/utils";
import { Mic, Square, Loader2 } from "lucide-react";

type RecordState = "idle" | "recording" | "processing";

interface RecordButtonProps {
  state: RecordState;
  rmsLevel?: number;
  onToggle: () => void;
  size?: "sm" | "md";
}

export function RecordButton({
  state,
  rmsLevel = 0,
  onToggle,
  size = "md",
}: RecordButtonProps) {
  const outerSize = size === "md" ? "w-36 h-36" : "w-24 h-24";
  const innerSize = size === "md" ? "w-20 h-20" : "w-14 h-14";
  const iconSize = size === "md" ? "w-9 h-9" : "w-6 h-6";

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-150",
          outerSize,
          state === "recording"
            ? "bg-rose-500/15 border-2 border-rose-500/40"
            : state === "processing"
            ? "bg-sky-500/10 border border-sky-500/30"
            : "bg-white/[0.03] border border-white/[0.08]"
        )}
        style={{
          boxShadow:
            state === "recording"
              ? `0 0 ${Math.round(rmsLevel * 40)}px rgba(251, 113, 133, 0.35)`
              : undefined,
        }}
      >
        {state === "processing" ? (
          <Loader2 className={cn("text-sky-400 animate-spin", iconSize)} />
        ) : state === "recording" ? (
          <button
            onClick={onToggle}
            className={cn(
              "rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-lg transition-transform active:scale-95",
              innerSize
            )}
          >
            <Square className={cn("text-white fill-current", size === "md" ? "w-7 h-7" : "w-5 h-5")} />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className={cn(
              "rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-600/25 transition-transform active:scale-95",
              innerSize
            )}
          >
            <Mic className={cn("text-white", iconSize)} />
          </button>
        )}
      </div>
    </div>
  );
}
