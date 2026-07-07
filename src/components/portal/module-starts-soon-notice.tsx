import { CalendarBlank } from "@phosphor-icons/react/ssr";
import { getFirstModuleName, MODULE_ONE_ACTIVE_NOTE, MODULE_STARTS_SOON_MESSAGE } from "@/lib/modules/student-module-access";

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
      className={`rounded-2xl border-2 border-dashed border-indigo-300/80 bg-gradient-to-br from-indigo-50/90 to-violet-50/50 ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-700">
          <CalendarBlank size={22} weight="duotone" />
        </span>
        <div>
          <p className={`font-bold text-foreground ${compact ? "text-sm" : "text-base"}`}>
            Your module will start soon — next month
          </p>
          <p className={`mt-1.5 text-muted ${compact ? "text-xs" : "text-sm"}`}>
            {MODULE_STARTS_SOON_MESSAGE}
          </p>
          <p className={`mt-2 text-muted ${compact ? "text-xs" : "text-sm"}`}>
            {MODULE_ONE_ACTIVE_NOTE}
            {firstModule ? (
              <>
                {" "}
                Active batch: <strong className="text-foreground">{firstModule}</strong>
              </>
            ) : null}
          </p>
          {studentModule && studentModule !== firstModule && (
            <p className="mt-2 text-xs font-medium text-indigo-800 bg-indigo-100/80 rounded-lg px-3 py-2 inline-block">
              Your registered module: {studentModule}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
