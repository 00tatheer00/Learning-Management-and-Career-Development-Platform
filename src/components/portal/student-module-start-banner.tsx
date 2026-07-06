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
        "rounded-2xl border-2 p-4 sm:p-5 shadow-sm",
        isApp
          ? "border-indigo-300 bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-50"
          : "border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50",
        className
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white",
            isApp ? "bg-indigo-600" : "bg-amber-500"
          )}
        >
          <CalendarBlank size={24} weight="duotone" />
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider",
              isApp ? "text-indigo-800" : "text-amber-800"
            )}
          >
            <Sparkle size={14} weight="fill" />
            {STUDENT_UR.schedule.bannerTitle(schedule.programLabel)}
          </p>
          <p
            className={cn(
              "mt-1 text-base sm:text-lg font-bold",
              isApp ? "text-indigo-950" : "text-amber-950"
            )}
          >
            {schedule.headline}
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              isApp ? "text-indigo-800" : "text-amber-800"
            )}
          >
            {schedule.daysLabel}
          </p>
          <p
            className={cn(
              "mt-1.5 text-sm leading-relaxed",
              isApp ? "text-indigo-900/90" : "text-amber-900/90"
            )}
          >
            {schedule.subline}
          </p>
        </div>
      </div>
    </div>
  );
}
