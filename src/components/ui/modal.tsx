"use client";

import { useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Bottom sheet on small screens (better for mobile chat flows). */
  mobileSheet?: boolean;
}

export function Modal({ open, onClose, title, children, className, mobileSheet }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex p-4",
        mobileSheet ? "items-end sm:items-center justify-center" : "items-center justify-center"
      )}
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 flex w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col rounded-2xl border border-border bg-background p-6 shadow-xl overflow-y-auto overscroll-contain",
          mobileSheet &&
            "max-sm:max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom)))] max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] max-sm:pt-4 max-sm:px-4",
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-bold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface hover:text-foreground"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
