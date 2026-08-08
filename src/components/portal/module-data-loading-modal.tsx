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
  title = "Loading Portal...",
  subtitle = "Synchronizing database records",
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
        if (prev >= 94) return 96;
        const step = Math.floor(Math.random() * 10) + 6;
        return Math.min(96, prev + step);
      });
    }, 220);

    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isLoading || !mounted) return null;

  // SVG ring dimensions
  const size = 112;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2; // 54
  const circumference = 2 * Math.PI * radius; // ~339.29
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return createPortal(
    <>
      {/* Top Fixed Gradient Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[1000000] h-1 bg-foreground/5 overflow-hidden pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(234,88,12,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Fullscreen Backdrop Overlay (NO CARD BOX BACKGROUND) */}
      <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-background/90 dark:bg-slate-950/90 backdrop-blur-2xl p-4 animate-in fade-in duration-200 select-none">
        {/* Soft Ambient Glowing Aura */}
        <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-primary/20 via-amber-500/10 to-indigo-500/20 blur-3xl pointer-events-none animate-pulse" />

        <div className="relative flex flex-col items-center gap-6 z-10 text-center max-w-sm">
          {/* Circular Progress Ring with Center EEST Brand Monogram */}
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              <defs>
                <linearGradient id="luxury-loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              {/* Outer Track Circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-foreground/10"
                fill="transparent"
              />
              {/* Glowing Dynamic Progress Stroke */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#luxury-loader-gradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 ease-out filter drop-shadow-[0_0_8px_rgba(234,88,12,0.6)]"
              />
            </svg>

            {/* Center Monogram */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 via-amber-500/10 to-indigo-500/10 border border-primary/25 flex items-center justify-center shadow-lg backdrop-blur-md animate-pulse">
                <span className="text-sm font-black tracking-tighter text-primary font-mono">
                  EEST
                </span>
              </div>
            </div>
          </div>

          {/* Text Information */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary">
              Emerging Edge School
            </p>
            <p className="text-base font-bold text-foreground">
              {title}
            </p>
            <p className="text-xs text-muted font-medium max-w-[240px]">
              {subtitle}
            </p>
          </div>

          {/* Percentage Indicator Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-extrabold text-primary shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>{progress}%</span>
            <span className="text-muted font-semibold text-[11px] uppercase tracking-wider">Syncing</span>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}


