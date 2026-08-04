"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
}

export function StudentModulesHub({
  currentModule,
  approvedModules,
  primaryProgramSlug,
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
    <div className="space-y-8">
      {programs.map((program) => {
        const isUserPrimaryProgram = program.slug === primaryProgramSlug;

        return (
          <div key={program.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pt-subtle pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-pt tracking-tight">
                    {program.title}
                  </h2>
                  {isUserPrimaryProgram && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Primary Course
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-pt-muted font-normal mt-1">
                  {program.description}
                </p>
              </div>
              <span className="text-xs font-medium text-pt-muted">
                {program.modules.length} Modules Total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      "relative group rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between overflow-hidden border",
                      isUnlocked
                        ? isActive
                          ? "bg-pt-surface border-2 border-primary/60 shadow-md ring-2 ring-primary/10"
                          : "bg-pt-surface border border-pt/70 hover:border-primary/40 shadow-sm hover:shadow-md"
                        : "bg-pt-surface/70 border border-pt/60 shadow-sm opacity-95"
                    )}
                  >
                    {/* Top status bar */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                            MODULE {index + 1}
                          </span>
                          <span className="text-xs text-pt-muted font-normal">
                            · {mod.duration}
                          </span>
                        </div>

                        {isUnlocked ? (
                          <div className="flex items-center gap-1.5">
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                <Sparkle size={12} weight="fill" className="text-primary" />
                                Active Portal
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                              <LockKeyOpen size={13} weight="fill" className="text-emerald-500" />
                              UNLOCKED
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            <LockKey size={13} weight="fill" className="text-amber-500" />
                            LOCKED
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-pt mb-1 group-hover:text-primary transition-colors">
                        {mod.name}
                      </h3>
                      <p className="text-xs text-pt-muted leading-relaxed mb-3">
                        {mod.subtitle}
                      </p>

                      {/* Topics preview */}
                      {mod.topics && mod.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {mod.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-pt-subtle text-pt-secondary border border-pt-subtle"
                            >
                              {topic}
                            </span>
                          ))}
                          {mod.topics.length > 3 && (
                            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-pt-subtle text-pt-muted">
                              +{mod.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions & Lock Overlay */}
                    <div className="pt-3.5 border-t border-pt-subtle flex flex-col gap-2.5">
                      {!isUnlocked && (
                        <div
                          className={cn(
                            "p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 flex items-start gap-2.5 shadow-sm transition-all duration-200",
                            isHovered && "bg-amber-500/12 border-amber-500/35"
                          )}
                        >
                          <Info size={16} weight="fill" className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs font-medium text-pt-muted leading-snug">
                            Register in this module first, then it will be unlocked.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 mt-1">
                        <span className="text-xs text-pt-muted font-medium">
                          {isUnlocked
                            ? isActive
                              ? "Currently viewing in portal"
                              : "Approved for your account"
                            : "Requires registration"}
                        </span>

                        {isUnlocked ? (
                          isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                              <CheckCircle size={16} weight="fill" />
                              Viewing
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSwitchModule(mod.name, program.slug)}
                              disabled={!!updatingModule}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                                "bg-primary text-primary-foreground hover:opacity-90 shadow-sm active:scale-95",
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
                                  <ArrowRight size={13} weight="bold" />
                                </>
                              )}
                            </button>
                          )
                        ) : (
                          <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-9 rounded-xl shadow-sm"
                          >
                            <Link href={`/register?program=${program.slug}`}>
                              Register in this Module
                              <ArrowRight size={13} weight="bold" className="ml-1" />
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
