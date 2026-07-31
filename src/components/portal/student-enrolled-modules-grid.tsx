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
        <span className="text-xs text-pt-muted font-medium bg-pt-subtle px-2.5 py-1 rounded-full border border-pt/40">
          Single Portal Access
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((moduleName, index) => {
          const isActive = moduleName === activeModule;
          const isLoading = updatingModule === moduleName;

          return (
            <div
              key={moduleName}
              className={cn(
                "relative group rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between",
                isActive
                  ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/40 shadow-lg shadow-primary/5 ring-1 ring-primary/30"
                  : "bg-pt-surface border-pt/60 hover:border-pt hover:shadow-md"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/80">
                    Module {index + 1}
                  </span>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                      <Sparkle size={12} weight="fill" className="text-emerald-500" />
                      Active Portal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-pt-subtle text-pt-muted border border-pt/40">
                      Enrolled
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-pt group-hover:text-primary transition-colors mb-1">
                  {moduleName}
                </h3>
                <p className="text-xs text-pt-muted line-clamp-2 mb-4 leading-relaxed">
                  Access lectures, assignments, live session links, and recordings for this module.
                </p>
              </div>

              <div className="pt-3 border-t border-pt/40 flex items-center justify-between">
                <span className="text-[11px] text-pt-faint font-medium">
                  {isActive ? "Currently viewing" : "Approved & Ready"}
                </span>

                {isActive ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                    <CheckCircle size={15} weight="fill" />
                    Viewing
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSwitchModule(moduleName)}
                    disabled={!!updatingModule}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
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
