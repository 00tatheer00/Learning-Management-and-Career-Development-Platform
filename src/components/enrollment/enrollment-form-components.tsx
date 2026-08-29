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
              "group relative flex w-full items-start justify-between gap-4 rounded-xl border p-4 sm:p-5 text-left transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-2 border-primary bg-primary/[0.04] shadow-sm"
                : "border-border bg-background hover:border-primary/40 hover:bg-secondary/50"
            )}
            role="radio"
            aria-checked={isSelected}
          >
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
              {/* Step / Module Number Badge */}
              <div
                className={cn(
                  "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-border/80 group-hover:border-primary/30"
                )}
              >
                {index + 1}
              </div>

              {/* Module Text Details */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-foreground leading-snug">
                    {mod.name}
                  </h4>
                  <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                    {mod.duration}
                  </span>
                </div>

                {mod.subtitle && (
                  <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
                    {mod.subtitle}
                  </p>
                )}

                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                  <CalendarDots size={14} className="shrink-0 text-primary" />
                  <span>{formatModuleSchedule(mod)}</span>
                </div>
              </div>
            </div>

            {/* Standard Professional Radio Button */}
            <div className="shrink-0 pt-0.5" aria-hidden="true">
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full transition-all duration-150",
                  isSelected
                    ? "border-2 border-primary bg-background"
                    : "border-2 border-slate-300 dark:border-slate-600 bg-background group-hover:border-primary/50"
                )}
              >
                {isSelected && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
