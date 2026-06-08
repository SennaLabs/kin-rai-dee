"use client";

import { cn } from "@/lib/utils/cn";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  reduced?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  danger = false,
  reduced = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className={cn(
          "w-full max-w-[320px] bg-white rounded-3xl p-5 shadow-card",
          !reduced && "animate-[rmDropIn_.3s_cubic-bezier(.34,1.5,.5,1)]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display m-0 text-xl font-bold text-ink text-center">
          {title}
        </h3>
        {message && (
          <p className="mt-2 mb-0 text-sm text-ink-3 text-center leading-relaxed">
            {message}
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <button
            className="rm-tap font-display flex-1 min-h-12 rounded-full border-2 border-solid border-line-strong bg-white text-ink font-semibold text-base cursor-pointer"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={cn(
              "rm-tap font-display flex-1 min-h-12 rounded-full border-none font-semibold text-base cursor-pointer text-white",
              danger ? "bg-cta" : "bg-good",
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
