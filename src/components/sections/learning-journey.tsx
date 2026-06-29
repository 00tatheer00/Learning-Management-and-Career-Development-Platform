"use client";

import { motion } from "framer-motion";
import {
  ClipboardText,
  UserCircleCheck,
  Student,
  CodeBlock,
  Exam,
  Medal,
  ChartLineUp,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { SectionHeader } from "@/components/shared/section-header";
import { PremiumIcon } from "@/components/shared/premium-icon";

const steps: { icon: Icon; title: string; description: string }[] = [
  {
    icon: ClipboardText,
    title: "Apply",
    description: "Submit your application and tell us about your goals",
  },
  {
    icon: UserCircleCheck,
    title: "Enroll",
    description: "Complete registration for your chosen program level",
  },
  {
    icon: Student,
    title: "Learn",
    description: "Access structured curriculum with live mentorship",
  },
  {
    icon: CodeBlock,
    title: "Build Projects",
    description: "Create real-world projects for your portfolio",
  },
  {
    icon: Exam,
    title: "Assessments",
    description: "Demonstrate mastery through practical evaluations",
  },
  {
    icon: Medal,
    title: "Certification",
    description: "Earn a verified certificate for every module you complete",
  },
  {
    icon: ChartLineUp,
    title: "Career Growth",
    description: "Launch your tech career with our support network",
  },
];

export function LearningJourneySection() {
  return (
    <section id="learning-paths" className="section-padding" aria-labelledby="journey-heading">
      <div className="container-custom">
        <SectionHeader
          label="Learning Journey"
          title="Your Path to Success"
          description="A structured, level-by-level approach that ensures mastery at every stage."
        />

        <div className="relative">
          <div
            className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 hidden lg:block"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center group cursor-default"
              >
                <div className="relative z-10 mx-auto mb-4 w-fit">
                  <PremiumIcon icon={step.icon} size="xl" />
                  <span className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md shadow-primary/30">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold mb-2 transition-colors duration-300 group-hover:text-primary">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4" aria-hidden="true">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-primary/50 to-primary/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
