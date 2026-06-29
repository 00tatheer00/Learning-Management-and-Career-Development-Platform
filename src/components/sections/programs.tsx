"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/shared/section-header";
import { ProgramCard } from "@/components/shared/program-card";
import { programs } from "@/lib/data/programs";

export function ProgramsSection() {
  return (
    <section id="programs" className="section-padding section-alt" aria-labelledby="programs-heading">
      <div className="container-custom">
        <SectionHeader
          label="Our Programs"
          title="Industry-Focused Training Programs"
          description="Modular courses with live classes — progress step by step, and earn a certificate for every module you complete."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className={program.slug === "web-development" || program.slug === "app-development" ? "md:col-span-1" : undefined}
            >
              <ProgramCard program={program} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
