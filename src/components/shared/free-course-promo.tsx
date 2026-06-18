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
        <span className="font-bold">Course is FREE</span>
        <span className="text-emerald-700">·</span>
        <span>
          Only {PAYMENT_CONFIG.currency} {PAYMENT_CONFIG.registrationFee.toLocaleString()}{" "}
          registration
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

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-8">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-emerald-500/30 mb-4">
            <Gift size={18} weight="fill" />
            100% Free Course
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2">
            {PAYMENT_CONFIG.headline}
          </h3>
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            {PAYMENT_CONFIG.freeNote}
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-xl border-2 border-primary/30 bg-white p-5 lg:p-6 shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-2">
            <CurrencyCircleDollar size={24} weight="duotone" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              {PAYMENT_CONFIG.registrationLabel}
            </span>
          </div>
          <p className="text-4xl sm:text-5xl font-bold text-primary leading-none mb-1">
            {PAYMENT_CONFIG.currency}{" "}
            {PAYMENT_CONFIG.registrationFee.toLocaleString()}
          </p>
          <p className="text-sm font-medium text-foreground mb-1">
            {PAYMENT_CONFIG.registrationNote}
          </p>
          <p className="text-xs text-muted leading-relaxed">
            This is a one-time payment to secure your seat. You do not pay for
            classes, levels, or course materials after this.
          </p>
        </div>
      </div>
    </div>
  );
}
