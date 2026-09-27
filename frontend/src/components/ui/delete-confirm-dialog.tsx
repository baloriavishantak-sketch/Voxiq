'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmDialogProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function DeleteConfirmDialog({
  title = "Delete Session",
  description = "This action cannot be undone. The session and all associated analytics will be permanently removed.",
  onConfirm,
  onCancel,
  isOpen,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm mx-4 rounded-xl border border-white/[0.08] bg-vox-elevated shadow-2xl animate-fade-in">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {description}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
