"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatModuleSchedule } from "@/lib/data/programs";
import type { ProgramModule } from "@/types";
import { CalendarDots } from "@phosphor-icons/react";

export function RequiredLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      <span className="ml-0.5 text-red-600" aria-hidden="true">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </Label>
  );
}

export function EnrollmentModulePicker({
  modules,
  value,
  onChange,
  disabled,
}: {
  modules: ProgramModule[];
  value: string;
  onChange: (moduleName: string) => void;
  disabled?: boolean;
}) {
  if (modules.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted">Select a program first to see available modules.</p>
    );
  }

  return (
    <div className="mt-3 space-y-3" role="radiogroup" aria-label="Starting module">
      {modules.map((mod, index) => {
        const isSelected = value === mod.name;

        return (
          <button
            key={mod.name}
            type="button"
            disabled={disabled}
            onClick={() => onChange(mod.name)}
            className={cn(
              "group relative w-full overflow-hidden rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-2 border-orange-500 bg-gradient-to-r from-orange-500/[0.08] via-orange-500/[0.03] to-background shadow-md shadow-orange-500/10 ring-4 ring-orange-500/15 dark:border-orange-500 dark:from-orange-950/40 dark:via-background dark:to-background"
                : "border-border/80 bg-background hover:border-orange-300 dark:hover:border-orange-600/50 hover:bg-orange-500/[0.02] hover:shadow-sm"
            )}
            role="radio"
            aria-checked={isSelected}
          >
            {/* Active Left Indicator Bar */}
            {isSelected && (
              <span
                className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 to-amber-600"
                aria-hidden="true"
              />
            )}

            <div className="flex items-start gap-3 sm:gap-4 pl-1 sm:pl-1.5">
              {/* Module Number Box */}
              <div
                className={cn(
                  "flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold transition-all duration-200",
                  isSelected
                    ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover:border-orange-200 group-hover:text-orange-600 dark:group-hover:text-orange-400"
                )}
              >
                {index + 1}
              </div>

              {/* Module Info */}
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h4
                    className={cn(
                      "text-sm sm:text-base font-bold transition-colors",
                      isSelected
                        ? "text-orange-950 dark:text-orange-100"
                        : "text-foreground group-hover:text-orange-900 dark:group-hover:text-orange-200"
                    )}
                  >
                    {mod.name}
                  </h4>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
                      isSelected
                        ? "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/60"
                        : "bg-surface-muted text-muted border border-border/60"
                    )}
                  >
                    {mod.duration}
                  </span>
                </div>

                {mod.subtitle && (
                  <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
                    {mod.subtitle}
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  <p
                    className={cn(
                      "text-xs font-semibold flex items-center gap-1.5 transition-colors",
                      isSelected
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-muted group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    )}
                  >
                    <CalendarDots size={14} className="shrink-0 text-orange-500" />
                    {formatModuleSchedule(mod)}
                  </p>
                </div>
              </div>

              {/* Modern Radio Button / Selection Checkmark */}
              <div className="shrink-0 flex items-center gap-2 pt-0.5">
                {isSelected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 text-white px-2.5 py-1 text-xs font-bold shadow-xs">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Selected</span>
                  </span>
                ) : (
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 bg-background transition-all duration-200 group-hover:border-orange-400 group-hover:scale-105"
                    aria-hidden="true"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-orange-300/40 transition-colors" />
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
