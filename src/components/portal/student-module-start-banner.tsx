import { CalendarBlank, Sparkle } from "@phosphor-icons/react/ssr";
import { getStudentClassSchedule, STUDENT_UR } from "@/lib/constants/student-portal-ur";
import { cn } from "@/lib/utils";

export function StudentModuleStartBanner({
  programSlug,
  className,
}: {
  programSlug?: string | null;
  className?: string;
}) {
  const schedule = getStudentClassSchedule(programSlug);
  const isApp = programSlug === "app-development";

  return (
    <div
      className={cn(
        "portal-card rounded-2xl p-4 sm:p-5",
        isApp ? "portal-tone-indigo" : "portal-tone-amber",
        className
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
            isApp ? "bg-slate-600" : "bg-stone-600"
          )}
        >
          <CalendarBlank size={24} weight="duotone" />
        </div>
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-pt-muted">
            <Sparkle size={14} weight="fill" className="text-primary" />
            {STUDENT_UR.schedule.bannerTitle(schedule.programLabel)}
          </p>
          <p className="mt-1 text-base sm:text-lg font-bold text-pt">{schedule.headline}</p>
          <p className="mt-1 text-sm font-semibold text-pt-secondary">{schedule.daysLabel}</p>
          <p className="mt-1 text-sm text-pt-muted leading-relaxed">{schedule.subline}</p>
        </div>
      </div>
    </div>
  );
}
