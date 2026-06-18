"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  UsersThree,
  FileText,
  GraduationCap,
  SealCheck,
} from "@phosphor-icons/react";
import { SectionHeader } from "@/components/shared/section-header";
import { FreeCoursePromo } from "@/components/shared/free-course-promo";
import { PremiumIcon } from "@/components/shared/premium-icon";
import { Button } from "@/components/ui/button";

const eligibility = [
  "Basic computer literacy and internet access",
  "English language proficiency for instruction",
  "Commitment to 10-15 hours per week minimum",
  "No prior coding experience required for Foundations",
  "Age 16+ (parental consent required for minors)",
];

const process = [
  { step: "1", title: "Submit Application", desc: "Fill out the enrollment form with your details and program preference" },
  { step: "2", title: "Admissions Review", desc: "Our team reviews your application within 2-3 business days" },
  { step: "3", title: "Level Assessment", desc: "Optional assessment to determine your starting level" },
  { step: "4", title: "Enrollment Confirmation", desc: "Receive welcome package and access to learning platform" },
  { step: "5", title: "Begin Learning", desc: "Start your first level with live orientation session" },
];

const requirements = [
  "Laptop or desktop computer (8GB RAM minimum)",
  "Stable internet connection (10 Mbps+)",
  "Webcam and microphone for live sessions",
  "Dedicated study space and schedule",
];

export function AdmissionsSection() {
  return (
    <section id="admissions" className="section-padding" aria-labelledby="admissions-heading">
      <div className="container-custom">
        <SectionHeader
          label="Admissions"
          title="Registration-Based Learning Model"
          description="Students join level by level, progressing at their own pace with continuous support and assessment."
        />

        <FreeCoursePromo className="mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
          >
            <PremiumIcon icon={UsersThree} size="lg" className="mb-6" />
            <h3 className="text-xl font-bold mb-4">Eligibility</h3>
            <ul className="space-y-3">
              {eligibility.map((item) => (
                <li key={item} className="group/item flex items-start gap-3 text-sm text-muted">
                  <SealCheck
                    size={20}
                    weight="duotone"
                    className="shrink-0 mt-0.5 text-primary transition-transform duration-300 group-hover/item:scale-110"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
          >
            <PremiumIcon icon={FileText} size="lg" className="mb-6" />
            <h3 className="text-xl font-bold mb-4">Application Process</h3>
            <div className="space-y-4">
              {process.map((item) => (
                <div key={item.step} className="group/step flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary transition-all duration-300 group-hover/step:bg-primary group-hover/step:text-primary-foreground group-hover/step:shadow-md group-hover/step:shadow-primary/25">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
          >
            <PremiumIcon icon={GraduationCap} size="lg" className="mb-6" />
            <h3 className="text-xl font-bold mb-4">Requirements</h3>
            <ul className="space-y-3 mb-6">
              {requirements.map((item) => (
                <li key={item} className="group/item flex items-start gap-3 text-sm text-muted">
                  <SealCheck
                    size={20}
                    weight="duotone"
                    className="shrink-0 mt-0.5 text-primary transition-transform duration-300 group-hover/item:scale-110"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <Button className="w-full" asChild>
              <Link href="/admissions">Learn More About Admissions</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
