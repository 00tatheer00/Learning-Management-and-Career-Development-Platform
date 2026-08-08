"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DynamicProgressBar } from "@/components/ui/dynamic-progress-bar";

interface ModuleDataLoadingModalProps {
  isLoading: boolean;
  title?: string;
}

export function ModuleDataLoadingModal({
  isLoading,
  title = "Updating Module...",
}: ModuleDataLoadingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoading || !mounted) return null;

  return createPortal(
    <div className="fixed inset-x-0 top-6 z-[999999] flex justify-center pointer-events-none px-4 animate-in slide-in-from-top-3 fade-in duration-200">
      <div className="bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border border-slate-700/80 shadow-xl rounded-full px-5 py-2.5 flex items-center gap-4 max-w-sm w-full backdrop-blur-md">
        <span className="text-xs font-semibold text-slate-200 shrink-0 truncate max-w-[140px]">
          {title}
        </span>
        <div className="flex-1 min-w-0">
          <DynamicProgressBar
            isLoading={isLoading}
            size="xs"
            showPercentage={true}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
