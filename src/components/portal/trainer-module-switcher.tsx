"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CaretDown,
  CheckCircle,
  Funnel,
  SpinnerGap,
  Sparkle,
  SquaresFour,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  getTrainerAvailableModules,
  resolveActiveTrainerModule,
  type TrainerModuleOption,
} from "@/lib/modules/trainer-module-access";

interface TrainerModuleSwitcherProps {
  currentModule: string | null;
  programSlug?: string | null;
  className?: string;
}

export function TrainerModuleSwitcher({
  currentModule,
  programSlug,
  className,
}: TrainerModuleSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const availableModules = getTrainerAvailableModules(programSlug);
  const activeModuleId = resolveActiveTrainerModule(currentModule, programSlug);

  const [selectedModule, setSelectedModule] = useState<string>(activeModuleId);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedModule(resolveActiveTrainerModule(currentModule, programSlug));
  }, [currentModule, programSlug]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLoading = isUpdating || isPending;

  const handleSelectModule = async (option: TrainerModuleOption) => {
    if (option.id === selectedModule || isLoading) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setSelectedModule(option.id);
    setIsOpen(false);

    try {
      localStorage.setItem("trainer_active_module", option.id);

      const res = await fetch("/api/trainer/switch-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleName: option.id,
          programSlug: programSlug || "web-development",
        }),
      });

      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      } else {
        console.error("Failed to switch active module for trainer");
        setSelectedModule(activeModuleId);
      }
    } catch (err) {
      console.error("Error switching module:", err);
      setSelectedModule(activeModuleId);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption =
    availableModules.find((m) => m.id === selectedModule) || availableModules[0];

  return (
    <>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[99999] overflow-hidden bg-indigo-100 dark:bg-indigo-950">
          <div className="h-full bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 animate-pulse w-full" />
        </div>
      )}

      <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isLoading}
          className={cn(
            "group inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
            currentOption.isAll
              ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
              : "bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 hover:from-primary/20 hover:to-primary/20 text-primary border border-primary/25 hover:border-primary/40 shadow-sm hover:shadow",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            isLoading && "opacity-75 cursor-not-allowed"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
          title="Switch active module scope for trainer actions"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {isLoading ? (
              <SpinnerGap size={14} className="animate-spin text-primary shrink-0" />
            ) : currentOption.isAll ? (
              <SquaresFour size={14} weight="duotone" className="text-amber-500 shrink-0" />
            ) : (
              <Sparkle size={14} weight="fill" className="text-primary shrink-0 animate-pulse" />
            )}
            <span className="text-[10px] uppercase tracking-wider text-pt-faint font-bold hidden sm:inline">
              Scope:
            </span>
            <span className="truncate max-w-[130px] sm:max-w-[190px] font-bold text-pt">
              {currentOption.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CaretDown
              size={13}
              weight="bold"
              className={cn(
                "transition-transform duration-200 shrink-0",
                currentOption.isAll ? "text-amber-500" : "text-primary",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </button>

        {isOpen && (
          <div
            className={cn(
              "absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 rounded-2xl bg-pt-surface border border-pt/60 shadow-2xl z-50 overflow-hidden",
              "animate-in fade-in slide-in-from-top-2 duration-150"
            )}
          >
            <div className="p-3 bg-pt-subtle/50 border-b border-pt/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Funnel size={18} weight="duotone" className="text-primary" />
                <div>
                  <p className="text-xs font-bold text-pt">Trainer Active Module</p>
                  <p className="text-[10px] text-pt-muted">Filters classes, assignments & students</p>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Module Filter
              </span>
            </div>

            <div className="p-1.5 space-y-1 max-h-64 overflow-y-auto">
              {availableModules.map((mod) => {
                const isActive = mod.id === selectedModule;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleSelectModule(mod)}
                    className={cn(
                      "w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                      isActive
                        ? mod.isAll
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30"
                          : "bg-primary/15 text-primary font-bold border border-primary/30"
                        : "hover:bg-pt-subtle text-pt hover:text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          isActive
                            ? mod.isAll
                              ? "bg-amber-500 animate-ping"
                              : "bg-primary animate-ping"
                            : "bg-pt-muted/40"
                        )}
                      />
                      <span className="truncate">{mod.name}</span>
                    </div>
                    {isActive && (
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className={mod.isAll ? "text-amber-500 shrink-0" : "text-primary shrink-0"}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
