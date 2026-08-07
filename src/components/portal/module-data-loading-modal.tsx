"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SpinnerGap } from "@phosphor-icons/react";

interface ModuleDataLoadingModalProps {
  isLoading: boolean;
}

export function ModuleDataLoadingModal({ isLoading }: ModuleDataLoadingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setProgress(15);
      return;
    }

    setProgress(20);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 94;
        const step = Math.floor(Math.random() * 12) + 6;
        return Math.min(94, prev + step);
      });
    }, 280);

    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isLoading || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center gap-3.5 max-w-xs w-full text-center relative overflow-hidden">
        <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm animate-spin">
          <SpinnerGap size={32} weight="bold" />
        </div>
        <div>
          <p className="text-base font-black text-slate-900">Fetching Module Data...</p>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Loading latest records from database</p>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1 border border-slate-200/60 relative">
          <div
            className="bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase -mt-1">
          {progress}% Syncing Records...
        </p>
      </div>
    </div>,
    document.body
  );
}
