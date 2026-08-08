"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModuleDataLoadingModalProps {
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

export function ModuleDataLoadingModal({
  isLoading,
  title = "Switching Module...",
  subtitle = "Loading module content",
}: ModuleDataLoadingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoading || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/25 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-background/95 dark:bg-slate-900/95 border border-border/80 rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-4 max-w-xs sm:max-w-sm w-full">
        {/* UIverse.io Premium Dual Orbital Loader */}
        <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin shadow-[0_0_12px_rgba(234,88,12,0.4)]" />
          <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-sky-500 border-l-sky-500 animate-[spin_1.2s_linear_infinite_reverse]" />
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary to-sky-500 animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.8)]" />
        </div>

        {/* Text details */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground truncate">{title}</p>
          <p className="text-xs text-muted font-medium truncate mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}



