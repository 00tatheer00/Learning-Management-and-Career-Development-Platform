"use client";

import { Sparkles, Video, Award, Users } from "lucide-react";
import { getProgramRegistrationFee } from "@/lib/constants/payment";
import { getProgramBySlug } from "@/lib/data/programs";

interface EnrollmentFeeSummaryProps {
  programSlug: string;
  moduleLevel?: string;
}

export function EnrollmentFeeSummary({
  programSlug,
  moduleLevel,
}: EnrollmentFeeSummaryProps) {
  const feeAmount = getProgramRegistrationFee(programSlug);
  const program = getProgramBySlug(programSlug);

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-background to-background p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Selected Course</span>
          <h4 className="text-base font-extrabold text-foreground">{program?.title ?? programSlug}</h4>
          {moduleLevel && (
            <p className="text-xs text-muted font-medium mt-0.5">Starting Module: {moduleLevel}</p>
          )}
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-black">
          Phase 2 Active
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted font-medium">Course Tuition Fee:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">100% FREE</span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm pt-1 border-t border-dashed border-border/60">
          <span className="font-bold text-foreground">Module Registration Fee:</span>
          <span className="text-base font-black text-primary">PKR {feeAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-border/80 space-y-2 text-xs">
        <p className="font-bold text-foreground text-xs flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500" />
          Included in your Registration:
        </p>

        <div className="grid grid-cols-1 gap-1.5 text-muted font-medium pl-1">
          <div className="flex items-center gap-2">
            <Video size={13} className="text-emerald-500 shrink-0" />
            <span>Live Interactive Mentorship Classes</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={13} className="text-sky-500 shrink-0" />
            <span>Student Portal &amp; Batch WhatsApp Group Access</span>
          </div>

          <div className="flex items-center gap-2">
            <Award size={13} className="text-orange-500 shrink-0" />
            <span>Official EEST Verified Skill Certificate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
