"use client";

import { Sparkle } from "@phosphor-icons/react";
import { StudentReveal } from "@/components/portal/student-motion";

const TIPS = [
  "Small daily practice beats one long cram session.",
  "Rewatch recordings at 1.25× when you revise.",
  "Ask in WhatsApp — your batch learns together.",
  "Join class on time — attendance builds habits.",
];

export function StudentDailySpark({ name }: { name: string }) {
  const first = name.split(" ")[0] ?? name;
  const tip = TIPS[first.length % TIPS.length] ?? TIPS[0];

  return (
    <StudentReveal delay={0.08} y={12}>
      <div className="student-spark-strip relative overflow-hidden rounded-2xl border border-pt px-4 py-3.5 sm:px-5">
        <div className="relative z-10 flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-[[#1873cc]]">
            <Sparkle size={18} weight="fill" className="student-sparkle" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pt-faint">
              Today&apos;s spark · {first}
            </p>
            <p className="mt-0.5 text-sm font-medium text-pt leading-relaxed">{tip}</p>
          </div>
        </div>
      </div>
    </StudentReveal>
  );
}
