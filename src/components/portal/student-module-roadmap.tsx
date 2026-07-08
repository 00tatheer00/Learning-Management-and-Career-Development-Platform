import { CheckCircle, MapTrifold } from "@phosphor-icons/react/ssr";
import { getProgramBySlug } from "@/lib/data/programs";
import { getProgramCategory, PREMIUM_HEADER_GRADIENT_FALLBACK } from "@/lib/constants/program-categories";
import { cn } from "@/lib/utils";

interface StudentModuleRoadmapProps {
  programSlug: string;
  currentModule?: string;
  enrolledModules?: string[];
}

export function StudentModuleRoadmap({
  programSlug,
  currentModule,
  enrolledModules = [],
}: StudentModuleRoadmapProps) {
  const program = getProgramBySlug(programSlug);
  const category = getProgramCategory(programSlug);
  const allModules = program?.modules ?? [];
  const enrolledSet = new Set(enrolledModules);
  const modules =
    enrolledModules.length > 0
      ? allModules.filter((mod) => enrolledSet.has(mod.name))
      : allModules;

  if (modules.length === 0) return null;

  const currentIndex = currentModule
    ? allModules.findIndex((mod) => mod.name === currentModule)
    : -1;

  return (
    <div className="rounded-2xl border border-border bg-background p-5 sm:p-6 mb-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl text-white bg-gradient-to-br",
            category?.headerGradient ?? PREMIUM_HEADER_GRADIENT_FALLBACK
          )}
        >
          <MapTrifold size={22} weight="duotone" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Your Module Roadmap</h2>
          <p className="text-sm text-muted">
            {program?.title}
            {enrolledModules.length > 0
              ? ` · ${enrolledModules.length} enrolled module${enrolledModules.length === 1 ? "" : "s"}`
              : ` · ${allModules.length} modules`}
            {currentModule ? ` · Active: ${currentModule}` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-0">
        {modules.map((mod, index) => {
          const globalIndex = allModules.findIndex((item) => item.name === mod.name);
          const isCurrent = currentModule ? mod.name === currentModule : false;
          const isCompleted = globalIndex >= 0 && currentIndex >= 0 && globalIndex < currentIndex;
          const isUpcoming = globalIndex >= 0 && currentIndex >= 0 && globalIndex > currentIndex;
          const isEnrolled = enrolledSet.has(mod.name);

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
                        You are here
                      </span>
                    )}
                    {isCompleted && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                        Done
                      </span>
                    )}
                    {isEnrolled && !isCurrent && !isCompleted && (
                      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-800">
                        Enrolled
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

      {currentIndex >= 0 && currentIndex < allModules.length - 1 && enrolledModules.length <= 1 && (
        <p className="mt-2 text-sm text-muted rounded-xl bg-surface px-4 py-3 border border-border">
          Next up: <strong>{allModules[currentIndex + 1]?.name}</strong> — register again when you
          finish this module and pay the next PKR 1,000 fee.
        </p>
      )}
    </div>
  );
}
