import { CheckCircle, MapTrifold } from "@phosphor-icons/react/ssr";
import { getProgramBySlug } from "@/lib/data/programs";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { cn } from "@/lib/utils";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

interface StudentModuleRoadmapProps {
  programSlug: string;
  currentModule?: string;
}

export function StudentModuleRoadmap({
  programSlug,
  currentModule,
}: StudentModuleRoadmapProps) {
  const program = getProgramBySlug(programSlug);
  const category = getProgramCategory(programSlug);
  const modules = program?.modules ?? [];

  if (modules.length === 0) return null;

  const currentIndex = currentModule
    ? modules.findIndex((mod) => mod.name === currentModule)
    : -1;

  return (
    <div className="rounded-2xl border border-border bg-background p-5 sm:p-6 mb-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl text-white bg-gradient-to-br",
            category?.headerGradient ?? "from-orange-500 to-amber-500"
          )}
        >
          <MapTrifold size={22} weight="duotone" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{STUDENT_UR.roadmap.title}</h2>
          <p className="text-sm text-muted">
            {STUDENT_UR.roadmap.subtitle(
              program?.title ?? "",
              modules.length,
              currentModule || undefined
            )}
          </p>
        </div>
      </div>

      <div className="space-y-0">
        {modules.map((mod, index) => {
          const isCurrent = currentIndex >= 0 ? index === currentIndex : mod.name === currentModule;
          const isCompleted = currentIndex >= 0 && index < currentIndex;
          const isUpcoming = currentIndex >= 0 && index > currentIndex;

          return (
            <div key={mod.name} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                    isCurrent && "border-primary bg-primary text-white",
                    isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                    isUpcoming && "border-border bg-surface text-muted",
                    currentIndex < 0 && !isCurrent && "border-border bg-surface text-muted"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle size={20} weight="fill" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                {index < modules.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[24px] my-1",
                      isCompleted ? "bg-emerald-300" : "bg-border"
                    )}
                  />
                )}
              </div>

              <div
                className={cn(
                  "flex-1 pb-6",
                  index === modules.length - 1 && "pb-0"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3",
                    isCurrent && "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
                    isCompleted && "border-emerald-200 bg-emerald-50/50",
                    !isCurrent && !isCompleted && "border-border bg-surface/50"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{mod.name}</p>
                    {isCurrent && (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                        {STUDENT_UR.roadmap.youAreHere}
                      </span>
                    )}
                    {isCompleted && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                        {STUDENT_UR.roadmap.done}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-1">{mod.subtitle}</p>
                  <p className="text-xs text-muted mt-2">{mod.duration}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {currentIndex >= 0 && currentIndex < modules.length - 1 && (
        <p className="mt-2 text-sm text-muted rounded-xl bg-surface px-4 py-3 border border-border">
          {STUDENT_UR.roadmap.nextUp(modules[currentIndex + 1]?.name ?? "")}
        </p>
      )}
    </div>
  );
}
