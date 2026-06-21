import { CalendarBlank, Sparkle } from "@phosphor-icons/react/ssr";
import { MODULE_1_CLASS_START } from "@/lib/constants/course-schedule";
import { cn } from "@/lib/utils";

export function StudentModuleStartBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
          <CalendarBlank size={24} weight="duotone" />
        </div>
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Sparkle size={14} weight="fill" />
            Course Schedule
          </p>
          <p className="mt-1 text-base sm:text-lg font-bold text-amber-950">
            {MODULE_1_CLASS_START.headline}
          </p>
          <p className="mt-1.5 text-sm text-amber-900/90 leading-relaxed">
            {MODULE_1_CLASS_START.subline}
          </p>
        </div>
      </div>
    </div>
  );
}
