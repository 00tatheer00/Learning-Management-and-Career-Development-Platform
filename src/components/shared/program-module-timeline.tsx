import { CalendarDots, Clock } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { formatModuleSchedule } from "@/lib/data/programs";
import type { ProgramModule } from "@/types";

interface ProgramModuleTimelineProps {
  modules: ProgramModule[];
  activeModuleName?: string;
}

export function ProgramModuleTimeline({
  modules,
  activeModuleName,
}: ProgramModuleTimelineProps) {
  return (
    <div className="space-y-4">
      {modules.map((mod, index) => {
        const isActive = activeModuleName === mod.name;

        return (
          <div
            key={mod.name}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-background p-5 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 sm:p-6",
              isActive
                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                : "border-border/70"
            )}
          >
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-primary/20" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      Module {index + 1}
                    </p>
                    {isActive && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                        Current
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-xl font-bold tracking-tight">{mod.name}</h3>
                  {mod.subtitle && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">{mod.subtitle}</p>
                  )}
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <Clock size={14} weight="duotone" aria-hidden="true" />
                  {mod.duration}
                </span>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/80 px-3 py-1.5 text-xs font-medium text-muted">
                <CalendarDots size={14} weight="duotone" className="text-primary" aria-hidden="true" />
                {formatModuleSchedule(mod)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
