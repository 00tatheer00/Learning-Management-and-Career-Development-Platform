"use client";

import { motion } from "framer-motion";
import { SealCheck } from "@phosphor-icons/react";
import { FreeCoursePromo } from "@/components/shared/free-course-promo";
import { RegistrationAccessInfo } from "@/components/shared/registration-access-info";
import { PaymentInfoCard } from "@/components/shared/payment-info-card";
import {
  eligibility,
  applicationProcess,
  requirements,
} from "@/lib/data/admissions";

export function RegistrationDetailsSidebar() {
  return (
    <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
      <FreeCoursePromo />

      <RegistrationAccessInfo />

      <PaymentInfoCard />

      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
          How Registration Works
        </h3>
        <div className="space-y-4">
          {applicationProcess.map((item) => (
            <div key={item.step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {item.step}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-xl border border-border bg-background p-5 shadow-sm"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
          Eligibility &amp; Requirements
        </h3>
        <ul className="space-y-2.5 mb-4">
          {eligibility.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
              <SealCheck
                size={18}
                weight="duotone"
                className="shrink-0 mt-0.5 text-primary"
              />
              {item}
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            You will need
          </p>
          <ul className="space-y-2">
            {requirements.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                <SealCheck
                  size={16}
                  weight="duotone"
                  className="shrink-0 mt-0.5 text-emerald-600"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </aside>
  );
}
