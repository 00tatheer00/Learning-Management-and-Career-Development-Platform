"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SpinnerGap } from "@phosphor-icons/react";

interface ModuleDataLoadingModalProps {
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

export function ModuleDataLoadingModal({
  isLoading,
  title = "Fetching Module Data...",
  subtitle = "Loading latest records from database",
}: ModuleDataLoadingModalProps) {
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
    }, 250);

    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isLoading || !mounted) return null;

  // Circle parameters for SVG circular progress ring
  const size = 96;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2; // 45
  const circumference = 2 * Math.PI * radius; // ~282.74
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full text-center relative overflow-hidden">
        {/* Dynamic Premium Circular Progress Ring */}
        <div className="relative flex items-center justify-center my-1">
          <svg width={size} height={size} className="transform -rotate-90">
            <defs>
              <linearGradient id="portal-loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {/* Background Circle Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-800"
              fill="transparent"
            />
            {/* Animated Gradient Progress Stroke */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#portal-loader-gradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Center Content: Spinning Icon without background box */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <SpinnerGap size={32} weight="bold" className="text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
        </div>

        {/* Text Details */}
        <div>
          <p className="text-base font-black text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{subtitle}</p>
        </div>

        {/* Status Badge with percentage */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
          {progress}% Syncing Records...
        </div>
      </div>
    </div>,
    document.body
  );
}

