import { Gift, CurrencyCircleDollar } from "@phosphor-icons/react";
import { PAYMENT_CONFIG } from "@/lib/constants/payment";
import { cn } from "@/lib/utils";

interface FreeCoursePromoProps {
  variant?: "banner" | "compact";
  className?: string;
}

export function FreeCoursePromo({
  variant = "banner",
  className,
}: FreeCoursePromoProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex flex-wrap items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800",
          className
        )}
      >
        <Gift size={18} weight="duotone" className="text-emerald-600" />
        <span className="font-bold">Course is 100% FREE</span>
        <span className="text-emerald-700">·</span>
        <span>
          Only One-Time Registration Fee: <strong className="text-orange-600">PKR 1,000</strong>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-emerald-400/50 bg-gradient-to-br from-emerald-50 via-white to-orange-50 shadow-lg shadow-emerald-500/10",
        className
      )}
    >
      <div
        className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500 px-3.5 py-1 text-xs sm:text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-emerald-500/30 mb-3">
            <Gift size={16} weight="fill" />
            100% Free Course Tuition
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight mb-2">
            Practical Online Classes
          </h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            All courses (Web Dev, App Dev &amp; AI) are 100% free! Pay only a one-time registration fee of PKR 1,000 per module to unlock live classes, recorded lectures, tasks, and portal access.
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-xl border border-primary/20 bg-white/90 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary mb-1.5">
            <CurrencyCircleDollar size={20} weight="duotone" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {PAYMENT_CONFIG.registrationLabel}
            </span>
          </div>
          <p className="text-lg sm:text-xl font-black text-primary leading-snug mb-1.5 break-words">
            PKR 1,000 / Module Only
          </p>
          <p className="text-xs font-semibold text-foreground mb-1">
            One-time registration fee per module across all courses (including AI).
          </p>
          <p className="text-[11px] text-muted leading-relaxed">
            All live classes, assignments, projects, and certificates in the module are fully included.
          </p>
        </div>
      </div>
    </div>
  );
}
