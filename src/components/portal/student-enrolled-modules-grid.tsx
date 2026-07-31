"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  CheckCircle,
  ArrowRight,
  SpinnerGap,
  Sparkle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface StudentEnrolledModulesGridProps {
  currentModule: string | null;
  approvedModules: string[];
  programSlug: string;
}

export function StudentEnrolledModulesGrid({
  currentModule,
  approvedModules,
  programSlug,
}: StudentEnrolledModulesGridProps) {
  const router = useRouter();
  const [updatingModule, setUpdatingModule] = useState<string | null>(null);

  const modules = Array.from(
    new Set(approvedModules.map((m) => m.trim()).filter(Boolean))
  );

  if (modules.length === 0) {
    return null;
  }

  const activeModule = currentModule || modules[0];

  const handleSwitchModule = async (moduleName: string) => {
    if (moduleName === activeModule || updatingModule) return;

    setUpdatingModule(moduleName);
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
        router.refresh();
      }
    } catch (err) {
      console.error("Error switching module:", err);
    } finally {
      setUpdatingModule(null);
    }
  };

  return (
    <section className="mt-8 mb-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap size={22} weight="duotone" className="text-primary" />
          <h2 className="text-lg font-bold text-pt tracking-tight">
            My Enrolled Modules ({modules.length})
          </h2>
        </div>
        <span className="text-xs text-pt-muted font-medium bg-pt-subtle px-2.5 py-1 rounded-full border border-pt-subtle">
          Single Portal Access
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((moduleName, index) => {
          const isActive = moduleName === activeModule;
          const isLoading = updatingModule === moduleName;

          return (
            <div
              key={moduleName}
              className={cn(
                "relative group rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between",
                isActive
                  ? "bg-pt-surface border-2 border-primary/60 shadow-md ring-2 ring-primary/10"
                  : "bg-pt-surface border border-pt/70 hover:border-primary/40 shadow-sm hover:shadow-md"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    MODULE {index + 1}
                  </span>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                      <Sparkle size={12} weight="fill" className="text-emerald-500" />
                      Active Portal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-pt-subtle text-pt-muted border border-pt-subtle">
                      Enrolled
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-pt group-hover:text-primary transition-colors mb-1">
                  {moduleName}
                </h3>
                <p className="text-xs text-pt-muted line-clamp-2 mb-4 leading-relaxed font-normal">
                  Access lectures, assignments, live session links, and recordings for this module.
                </p>
              </div>

              <div className="pt-3 border-t border-pt-subtle flex items-center justify-between">
                <span className="text-xs text-pt-muted font-medium">
                  {isActive ? "Currently viewing" : "Approved & Ready"}
                </span>

                {isActive ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                    <CheckCircle size={16} weight="fill" />
                    Viewing
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSwitchModule(moduleName)}
                    disabled={!!updatingModule}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                      "bg-primary text-primary-foreground hover:opacity-90 shadow-sm active:scale-95",
                      updatingModule && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <SpinnerGap size={14} className="animate-spin" />
                        Switching...
                      </>
                    ) : (
                      <>
                        Switch Module
                        <ArrowRight size={13} weight="bold" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
