"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DynamicProgressBar } from "@/components/ui/dynamic-progress-bar";
import { GraduationCap } from "@phosphor-icons/react";

interface ModuleDataLoadingModalProps {
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

const MODULE_SWITCH_STEPS = [
  "Connecting to module context...",
  "Loading lectures & study materials...",
  "Updating attendance & progression...",
  "Rendering module dashboard...",
];

export function ModuleDataLoadingModal({
  isLoading,
  title = "Switching Module",
}: ModuleDataLoadingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoading || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-background/95 dark:bg-slate-900/95 border border-border/80 rounded-2xl p-5 shadow-2xl max-w-sm sm:max-w-md w-full space-y-4">
        {/* Header Icon + Badge */}
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
              <GraduationCap size={22} weight="duotone" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground leading-snug">{title}</h4>
              <p className="text-[11px] text-muted font-medium">Please wait while we sync data</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            DYNAMIC SYNC
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <DynamicProgressBar
          isLoading={isLoading}
          steps={MODULE_SWITCH_STEPS}
          size="md"
          variant="gradient"
          showPercentage={true}
        />
      </div>
    </div>,
    document.body
  );
}
