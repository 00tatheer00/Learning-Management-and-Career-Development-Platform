"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CircleNotch, Sparkle, Lightning } from "@phosphor-icons/react";

export interface DynamicProgressBarProps {
  /** If provided, manually controls progress (0 to 100). If omitted, auto-progress simulation is used. */
  progress?: number;
  /** Whether loading is actively taking place */
  isLoading?: boolean;
  /** Primary title text above progress bar */
  title?: string;
  /** Array of step subtitles displayed dynamically as progress advances */
  steps?: string[];
  /** Subtitle to show if steps array is not provided */
  subtitle?: string;
  /** Height size of the progress bar: 'sm' (6px), 'md' (10px), 'lg' (14px) */
  size?: "sm" | "md" | "lg";
  /** Color theme variant */
  variant?: "primary" | "emerald" | "sky" | "gradient";
  /** Show live percentage badge */
  showPercentage?: boolean;
  /** Class name override for container */
  className?: string;
  /** Optional callback when simulated progress reaches 100% */
  onComplete?: () => void;
}

const DEFAULT_STEPS = [
  "Initializing portal session...",
  "Fetching course resources...",
  "Synchronizing module state...",
  "Finalizing layout rendering...",
];

export function DynamicProgressBar({
  progress: customProgress,
  isLoading = true,
  title,
  steps = DEFAULT_STEPS,
  subtitle,
  size = "md",
  variant = "gradient",
  showPercentage = true,
  className,
  onComplete,
}: DynamicProgressBarProps) {
  const [internalProgress, setInternalProgress] = useState(0);

  // Handle simulated smooth progress increment if customProgress is not provided
  useEffect(() => {
    if (customProgress !== undefined) {
      setInternalProgress(Math.min(100, Math.max(0, customProgress)));
      return;
    }

    if (!isLoading) {
      setInternalProgress(100);
      return;
    }

    setInternalProgress(0);

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 92) {
          // Slow down near the end while waiting
          return prev + Math.random() * 0.8;
        }
        if (prev >= 60) {
          return prev + Math.random() * 4 + 1.5;
        }
        return prev + Math.random() * 8 + 4;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [customProgress, isLoading]);

  useEffect(() => {
    if (internalProgress >= 100 && onComplete) {
      onComplete();
    }
  }, [internalProgress, onComplete]);

  const currentPercent = Math.min(100, Math.round(internalProgress));

  // Determine current active step text based on percentage
  const currentStepIndex = Math.min(
    steps.length - 1,
    Math.floor((currentPercent / 100) * steps.length)
  );
  const activeSubtitle = subtitle ?? steps[currentStepIndex] ?? "Loading...";

  const sizeClasses = {
    sm: "h-1.5 rounded-full",
    md: "h-2.5 rounded-full",
    lg: "h-3.5 rounded-full",
  };

  const variantGradients = {
    primary: "from-orange-500 via-amber-500 to-orange-600 shadow-[0_0_12px_rgba(234,88,12,0.5)]",
    emerald: "from-emerald-500 via-teal-400 to-cyan-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]",
    sky: "from-sky-500 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(14,165,233,0.5)]",
    gradient: "from-orange-500 via-amber-400 to-sky-400 shadow-[0_0_14px_rgba(249,115,22,0.6)]",
  };

  return (
    <div className={cn("w-full space-y-2 select-none", className)}>
      {/* Title & Percentage Header */}
      {(title || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-foreground truncate max-w-[70%]">
            <Sparkle size={14} weight="fill" className="text-amber-500 shrink-0 animate-pulse" />
            <span className="truncate">{title ?? "Processing..."}</span>
          </div>

          {showPercentage && (
            <div className="flex items-center gap-1 bg-surface-muted/90 border border-border/60 px-2 py-0.5 rounded-full font-mono text-[11px] font-bold text-foreground shadow-xs">
              <Lightning size={12} weight="fill" className="text-orange-500 shrink-0" />
              <span>{currentPercent}%</span>
            </div>
          )}
        </div>
      )}

      {/* Progress Track & Bar */}
      <div
        className={cn(
          "relative w-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden p-[2px] border border-slate-300/60 dark:border-slate-700/60 shadow-inner",
          sizeClasses[size]
        )}
      >
        {/* Animated Progress Bar Fill */}
        <div
          className={cn(
            "relative h-full transition-all duration-300 ease-out bg-gradient-to-r flex items-center justify-end pr-0.5",
            sizeClasses[size],
            variantGradients[variant]
          )}
          style={{ width: `${currentPercent}%` }}
        >
          {/* Shimmer sweep animation overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />

          {/* Leading Tip Glow Dot */}
          {currentPercent > 2 && currentPercent < 100 && (
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-ping opacity-90" />
          )}
        </div>
      </div>

      {/* Subtitle / Dynamic Step Indicator */}
      <div className="flex items-center justify-between text-[11px] text-muted font-medium pt-0.5">
        <span className="truncate max-w-[85%] transition-all duration-200">
          {activeSubtitle}
        </span>
        {isLoading && currentPercent < 100 && (
          <CircleNotch size={12} className="animate-spin text-muted shrink-0 ml-2" />
        )}
      </div>
    </div>
  );
}
