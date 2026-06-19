"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Clock, ChartBar, SealCheck } from "@phosphor-icons/react";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { programs } from "@/lib/data/programs";

export function ProgramsSection() {
  return (
    <section id="programs" className="section-padding section-alt" aria-labelledby="programs-heading">
      <div className="container-custom">
        <SectionHeader
          label="Our Programs"
          title="Industry-Focused Training Programs"
          description="Choose from our comprehensive programs designed to take you from beginner to job-ready professional."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant={program.category === "future" ? "future" : "default"}>
                      {program.category === "future" ? "Coming Soon" : "Enrolling Now"}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {program.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-muted leading-relaxed">
                    {program.description}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm text-muted">
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 transition-colors duration-300 group-hover:bg-primary/5">
                      <Clock size={16} weight="duotone" className="text-primary" aria-hidden="true" />
                      {program.duration}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 transition-colors duration-300 group-hover:bg-primary/5">
                      <ChartBar size={16} weight="duotone" className="text-primary" aria-hidden="true" />
                      {program.level}
                    </span>
                  </div>

                  {program.levels.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                        Levels
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {program.levels.map((level) => (
                          <span
                            key={level.name}
                            className="tag"
                          >
                            {level.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <ul className="space-y-2">
                    {program.outcomes.slice(0, 3).map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2.5 text-sm text-muted">
                        <SealCheck
                          size={18}
                          weight="duotone"
                          className="text-primary shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110"
                          aria-hidden="true"
                        />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {program.category === "active" && (
                    <Button className="w-full" asChild>
                      <Link href={`/programs/${program.slug}`}>
                        View Program
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
