import { CalendarBlank } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { getStudentModuleSchedule } from "@/lib/constants/course-schedule";

interface ModuleStartsSoonNoticeProps {
  programSlug: string;
  studentModule?: string | null;
  compact?: boolean;
}

export function ModuleStartsSoonNotice({
  programSlug,
  studentModule,
  compact = false,
}: ModuleStartsSoonNoticeProps) {
  const schedule = getStudentModuleSchedule(programSlug, studentModule);

  return (
    <div
      className={cn(
        "portal-card rounded-2xl border border-primary/30 bg-primary/5",
        compact ? "p-4" : "p-5 sm:p-6"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/25">
          <CalendarBlank size={22} weight="duotone" />
        </span>
        <div>
          <p className={cn("font-bold text-pt", compact ? "text-sm" : "text-base")}>
            {schedule.headline}
          </p>
          <p className={cn("mt-1.5 text-pt-muted leading-relaxed", compact ? "text-xs" : "text-sm")}>
            {schedule.subline}
          </p>
          {studentModule && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/15 text-primary">
                Selected Active Module: {studentModule}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
