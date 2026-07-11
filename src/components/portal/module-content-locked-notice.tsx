import { LockSimple } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import {
  MODULE_CONTENT_LOCKED_MESSAGE,
  MODULE_CONTENT_LOCKED_SHORT,
} from "@/lib/modules/module-content-messages";

interface ModuleContentLockedNoticeProps {
  studentModule?: string | null;
  lockedModule?: string | null;
  compact?: boolean;
  className?: string;
}

export function ModuleContentLockedNotice({
  studentModule,
  lockedModule,
  compact = false,
  className,
}: ModuleContentLockedNoticeProps) {
  return (
    <div
      className={cn(
        "portal-card rounded-2xl border border-pt border-dashed",
        compact ? "p-4" : "p-5 sm:p-6",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/25">
          <LockSimple size={22} weight="duotone" />
        </span>
        <div>
          <p className={cn("font-semibold text-pt", compact ? "text-sm" : "text-base")}>
            {lockedModule ? `${lockedModule} is not your module` : "Not available for your module"}
          </p>
          <p className={cn("mt-1.5 text-pt-muted leading-relaxed", compact ? "text-xs" : "text-sm")}>
            {MODULE_CONTENT_LOCKED_MESSAGE}
          </p>
          <p className={cn("mt-2 text-pt-muted", compact ? "text-xs" : "text-sm")}>
            {MODULE_CONTENT_LOCKED_SHORT}
          </p>
          {studentModule && (
            <p className="mt-2 text-xs font-medium student-badge-live rounded-lg px-3 py-2 inline-block">
              Your module: {studentModule}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
