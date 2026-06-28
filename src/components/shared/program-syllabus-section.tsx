"use client";

import Link from "next/link";
import { BookOpen, Sparkle } from "@phosphor-icons/react";
import { CourseModulesSyllabus } from "@/components/portal/course-modules-syllabus";
import {
  getProgramTopicCount,
  programHasSyllabus,
} from "@/lib/data/programs";
import type { Program } from "@/types";

interface ProgramSyllabusSectionProps {
  program: Program;
  /** Compact layout for registration form */
  compact?: boolean;
  showViewProgramLink?: boolean;
}

export function ProgramSyllabusSection({
  program,
  compact = false,
  showViewProgramLink = false,
}: ProgramSyllabusSectionProps) {
  if (!programHasSyllabus(program)) return null;

  const topicCount = getProgramTopicCount(program);
  const moduleCount = program.modules.filter((mod) => (mod.topics?.length ?? 0) > 0).length;

  return (
    <div id="curriculum" className={compact ? "mt-6" : "mb-14"}>
      <div className={compact ? "mb-4" : "mb-6"}>
        {!compact && (
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
            Full Syllabus
          </p>
        )}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              className={
                compact
                  ? "text-lg font-bold"
                  : "mt-2 text-2xl font-bold sm:text-3xl"
              }
            >
              {compact ? "What you will study" : "Everything You Will Learn"}
            </h2>
            <p className={`max-w-2xl text-muted ${compact ? "mt-1 text-sm" : "mt-2"}`}>
              {compact
                ? "Har module par click karein — poori topic list dekhein aur samjhein ke aap kya seekhenge."
                : `${moduleCount} modules, ${topicCount}+ hands-on topics — zero se job-ready tak. Har module par click karke poori list dekhein.`}
            </p>
          </div>
          {!compact && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                <BookOpen size={14} weight="duotone" />
                {moduleCount} modules
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkle size={14} weight="duotone" />
                {topicCount} topics
              </span>
            </div>
          )}
        </div>
      </div>

      <CourseModulesSyllabus program={program} />

      {showViewProgramLink && (
        <p className="mt-4 text-sm text-muted">
          Full program details:{" "}
          <Link
            href={`/programs/${program.slug}#curriculum`}
            className="font-semibold text-primary hover:underline"
          >
            View on program page →
          </Link>
        </p>
      )}
    </div>
  );
}
