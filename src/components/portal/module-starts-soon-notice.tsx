import { CalendarBlank } from "@phosphor-icons/react/ssr";
import { getFirstModuleName, MODULE_ONE_ACTIVE_NOTE, MODULE_STARTS_SOON_MESSAGE } from "@/lib/modules/student-module-access";
import { cn } from "@/lib/utils";

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
  const firstModule = getFirstModuleName(programSlug);

  return (
    <div
      className={cn(
        "portal-card rounded-2xl portal-tone-indigo border-dashed",
        compact ? "p-4" : "p-5 sm:p-6"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-200/80 text-stone-600 dark:bg-stone-700/50 dark:text-stone-300">
          <CalendarBlank size={22} weight="duotone" />
        </span>
        <div>
          <p className={cn("font-semibold text-pt", compact ? "text-sm" : "text-base")}>
            Your module will start soon — next month
          </p>
          <p className={cn("mt-1.5 text-pt-muted leading-relaxed", compact ? "text-xs" : "text-sm")}>
            {MODULE_STARTS_SOON_MESSAGE}
          </p>
          <p className={cn("mt-2 text-pt-muted", compact ? "text-xs" : "text-sm")}>
            {MODULE_ONE_ACTIVE_NOTE}
            {firstModule ? (
              <>
                {" "}
                Active batch: <strong className="text-pt">{firstModule}</strong>
              </>
            ) : null}
          </p>
          {studentModule && studentModule !== firstModule && (
            <p className="mt-2 text-xs font-medium student-badge-pending rounded-lg px-3 py-2 inline-block">
              Your registered module: {studentModule}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
