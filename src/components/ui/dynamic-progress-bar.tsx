"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface DynamicProgressBarProps {
  /** Controlled percentage (0 to 100). If omitted, smooth simulated progress is used. */
  progress?: number;
  /** Whether loading is actively taking place */
  isLoading?: boolean;
  /** Label text shown next to or above bar */
  label?: string;
  /** Height size of the progress bar: 'xs' (2px), 'sm' (4px), 'md' (6px) */
  size?: "xs" | "sm" | "md";
  /** Show live percentage text */
  showPercentage?: boolean;
  /** Class name override */
  className?: string;
}

export function DynamicProgressBar({
  progress: customProgress,
  isLoading = true,
  label,
  size = "sm",
  showPercentage = false,
  className,
}: DynamicProgressBarProps) {
  const [internalProgress, setInternalProgress] = useState(0);

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
        if (prev >= 90) return prev + 0.5;
        if (prev >= 65) return prev + Math.random() * 3 + 1;
        return prev + Math.random() * 10 + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [customProgress, isLoading]);

  const currentPercent = Math.min(100, Math.round(internalProgress));

  const heights = {
    xs: "h-0.5",
    sm: "h-1",
    md: "h-1.5",
  };

  return (
    <div className={cn("w-full space-y-1.5 select-none", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-medium text-muted">
          {label && <span className="truncate">{label}</span>}
          {showPercentage && (
            <span className="font-mono text-[11px] font-semibold text-foreground ml-auto">
              {currentPercent}%
            </span>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div className={cn("w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn(
            "h-full bg-primary transition-all duration-200 ease-out rounded-full",
            heights[size]
          )}
          style={{ width: `${currentPercent}%` }}
        />
      </div>
    </div>
  );
}
