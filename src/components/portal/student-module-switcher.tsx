"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CaretDown,
  CheckCircle,
  GraduationCap,
  SpinnerGap,
  Sparkle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface StudentModuleSwitcherProps {
  currentModule: string | null;
  approvedModules: string[];
  programSlug: string;
  className?: string;
}

export function StudentModuleSwitcher({
  currentModule,
  approvedModules,
  programSlug,
  className,
}: StudentModuleSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [selectedModule, setSelectedModule] = useState<string | null>(
    currentModule || approvedModules[0] || null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentModule) {
      setSelectedModule(currentModule);
    }
  }, [currentModule]);

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

  // Deduplicate and filter empty modules
  const modules = Array.from(
    new Set(approvedModules.map((m) => m.trim()).filter(Boolean))
  );

  if (modules.length === 0) {
    return null;
  }

  const activeModuleName = selectedModule || modules[0];
  const isLoading = isUpdating || isPending;

  const handleSelectModule = async (moduleName: string) => {
    if (moduleName === activeModuleName || isLoading) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setSelectedModule(moduleName);
    setIsOpen(false);

    try {
      const res = await fetch("/api/student/switch-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleName,
          programSlug,
        }),
      });

      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      } else {
        console.error("Failed to switch active module");
        setSelectedModule(currentModule);
      }
    } catch (err) {
      console.error("Error switching module:", err);
      setSelectedModule(currentModule);
    } finally {
      setIsUpdating(false);
    }
  };

  // If only 1 module enrolled, show a sleek indicator pill
  if (modules.length <= 1) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm",
          className
        )}
      >
        <GraduationCap size={14} weight="duotone" className="text-emerald-500 shrink-0" />
        <span className="truncate max-w-[160px] sm:max-w-[220px]">
          {activeModuleName}
        </span>
      </div>
    );
  }

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
            "bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 hover:from-primary/20 hover:to-primary/20",
            "text-primary border border-primary/25 hover:border-primary/40 shadow-sm hover:shadow",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            isLoading && "opacity-75 cursor-not-allowed"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {isLoading ? (
              <SpinnerGap size={14} className="animate-spin text-primary shrink-0" />
            ) : (
              <Sparkle size={14} weight="fill" className="text-primary shrink-0 animate-pulse" />
            )}
            <span className="text-[10px] uppercase tracking-wider text-primary/70 font-bold hidden sm:inline">
              Active:
            </span>
            <span className="truncate max-w-[130px] sm:max-w-[190px] font-bold text-pt">
              {activeModuleName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded-md bg-primary/15 text-[10px] font-bold text-primary">
              {modules.length} Modules
            </span>
            <CaretDown
              size={13}
              weight="bold"
              className={cn(
                "text-primary transition-transform duration-200 shrink-0",
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
                <GraduationCap size={18} weight="duotone" className="text-primary" />
                <div>
                  <p className="text-xs font-bold text-pt">Enrolled Modules</p>
                  <p className="text-[10px] text-pt-muted">Switch active view</p>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                1 Account Portal
              </span>
            </div>

            <div className="p-1.5 space-y-1 max-h-64 overflow-y-auto">
              {modules.map((mod) => {
                const isActive = mod === activeModuleName;
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => handleSelectModule(mod)}
                    className={cn(
                      "w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/15 text-primary font-bold border border-primary/30"
                        : "hover:bg-pt-subtle text-pt hover:text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          isActive ? "bg-primary animate-ping" : "bg-pt-muted/40"
                        )}
                      />
                      <span className="truncate">{mod}</span>
                    </div>
                    {isActive && (
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className="text-primary shrink-0"
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
