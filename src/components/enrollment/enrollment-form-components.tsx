"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatModuleSchedule } from "@/lib/data/programs";
import type { ProgramModule } from "@/types";
import { Clock, CalendarDots } from "@phosphor-icons/react";

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
              "w-full rounded-xl border p-4 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                : "border-border bg-background hover:border-primary/30 hover:bg-surface/50"
            )}
            role="radio"
            aria-checked={isSelected}
          >
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-foreground">{mod.name}</h4>
                  <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                    {mod.duration}
                  </span>
                </div>

                <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
                  {mod.description}
                </p>

                {mod.schedule ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary font-medium">
                    <span className="flex items-center gap-1">
                      <CalendarDots size={14} className="shrink-0" />
                      {mod.schedule.days.join(", ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="shrink-0" />
                      {mod.schedule.time}
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-primary font-medium">
                    {formatModuleSchedule(mod.name)}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
