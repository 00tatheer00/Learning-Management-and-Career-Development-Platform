"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { TrainerCard } from "@/components/shared/trainer-card";
import { Button } from "@/components/ui/button";
import { trainers } from "@/lib/data/trainers";

export function TrainersSection() {
  return (
    <section className="section-padding section-alt" aria-labelledby="trainers-heading">
      <div className="container-custom">
        <SectionHeader
          label="Expert Mentors"
          title="Learn from Industry Leaders"
          description="Our trainers bring real-world experience from top tech companies to guide your learning journey."
        />

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
          {trainers.map((trainer, index) => (
            <motion.div
              key={trainer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <TrainerCard trainer={trainer} />
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="secondary" asChild>
            <Link href="/trainers">
              View All Trainers
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
