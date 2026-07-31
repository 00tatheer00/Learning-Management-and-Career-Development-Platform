"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  LockKey,
  LockKeyOpen,
  CheckCircle,
  ArrowRight,
  Sparkle,
  SpinnerGap,
  Info,
} from "@phosphor-icons/react";
import { programs } from "@/lib/data/programs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudentModulesHubProps {
  currentModule: string | null;
  approvedModules: string[];
  primaryProgramSlug: string;
  userEmail: string;
}

export function StudentModulesHub({
  currentModule,
  approvedModules,
  primaryProgramSlug,
  userEmail,
}: StudentModulesHubProps) {
  const router = useRouter();
  const [updatingModule, setUpdatingModule] = useState<string | null>(null);
  const [hoveredLockedModule, setHoveredLockedModule] = useState<string | null>(null);

  const approvedSet = new Set(
    approvedModules.map((m) => m.trim().toLowerCase()).filter(Boolean)
  );

  const activeModule = currentModule?.trim();

  const handleSwitchModule = async (moduleName: string, programSlug: string) => {
    if (moduleName.trim() === activeModule || updatingModule) return;

    setUpdatingModule(moduleName);
    try {
      const res = await fetch("/api/student/switch-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleName: moduleName.trim(),
          programSlug,
        }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error switching module:", err);
    } finally {
      setUpdatingModule(null);
    }
  };

  return (
    <div className="space-y-10">
      {programs.map((program) => {
        const isUserPrimaryProgram = program.slug === primaryProgramSlug;

        return (
          <div key={program.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    {program.title}
                  </h2>
                  {isUserPrimaryProgram && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                      Primary Course
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
                  {program.description}
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {program.modules.length} Modules Total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {program.modules.map((mod, index) => {
                const isUnlocked = approvedSet.has(mod.name.trim().toLowerCase());
                const isActive = isUnlocked && mod.name.trim() === activeModule;
                const isUpdating = updatingModule === mod.name;
                const isHovered = hoveredLockedModule === mod.name;

                return (
                  <div
                    key={mod.name}
                    onMouseEnter={() => !isUnlocked && setHoveredLockedModule(mod.name)}
                    onMouseLeave={() => !isUnlocked && setHoveredLockedModule(null)}
                    className={cn(
                      "relative group rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden border",
                      isUnlocked
                        ? isActive
                          ? "bg-white dark:bg-slate-900 border-primary shadow-xl ring-2 ring-primary/30"
                          : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-md hover:shadow-xl"
                        : "bg-slate-50/80 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 shadow-sm"
                    )}
                  >
                    {/* Top status bar */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                            MODULE {index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            · {mod.duration}
                          </span>
                        </div>

                        {isUnlocked ? (
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30">
                                <Sparkle size={13} weight="fill" className="text-primary" />
                                Active Portal
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 shadow-sm">
                              <LockKeyOpen size={14} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                              UNLOCKED
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-950 border border-amber-400 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700 shadow-sm">
                            <LockKey size={14} weight="fill" className="text-amber-600 dark:text-amber-400" />
                            LOCKED
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-primary transition-colors">
                        {mod.name}
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-4">
                        {mod.subtitle}
                      </p>

                      {/* Topics preview */}
                      {mod.topics && mod.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {mod.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                            >
                              {topic}
                            </span>
                          ))}
                          {mod.topics.length > 3 && (
                            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              +{mod.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions & Lock Overlay */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                      {!isUnlocked && (
                        <div
                          className={cn(
                            "p-3.5 rounded-2xl bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 shadow-sm transition-all duration-200",
                            isHovered && "bg-amber-200/90 dark:bg-amber-900/80 border-amber-400 scale-[1.01]"
                          )}
                        >
                          <Info size={18} weight="fill" className="text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs font-bold text-amber-950 dark:text-amber-200 leading-snug">
                            Register in this module first, then it will be unlocked.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 mt-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {isUnlocked
                            ? isActive
                              ? "Currently viewing in portal"
                              : "Approved for your account"
                            : "Requires registration"}
                        </span>

                        {isUnlocked ? (
                          isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-primary">
                              <CheckCircle size={17} weight="fill" />
                              Viewing
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSwitchModule(mod.name, program.slug)}
                              disabled={!!updatingModule}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200",
                                "bg-primary text-primary-foreground hover:opacity-90 shadow-md active:scale-95",
                                isUpdating && "opacity-60 cursor-not-allowed"
                              )}
                            >
                              {isUpdating ? (
                                <>
                                  <SpinnerGap size={14} className="animate-spin" />
                                  Switching...
                                </>
                              ) : (
                                <>
                                  Switch to Module
                                  <ArrowRight size={14} weight="bold" />
                                </>
                              )}
                            </button>
                          )
                        ) : (
                          <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs h-9 rounded-xl shadow-md"
                          >
                            <Link href={`/register?program=${program.slug}`}>
                              Register in this Module
                              <ArrowRight size={14} weight="bold" className="ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
