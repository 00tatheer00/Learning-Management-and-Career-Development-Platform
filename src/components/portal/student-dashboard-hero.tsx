"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, VideoCamera, CalendarBlank } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ProgramCategoryBadge } from "@/components/portal/program-category-badge";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { getProgramBySlug } from "@/lib/data/programs";
import { getStudentClassSchedule } from "@/lib/constants/student-portal-ur";

interface StudentDashboardHeroProps {
  name: string;
  programSlug: string;
  moduleName?: string | null;
  canJoinLive: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function StudentDashboardHero({
  name,
  programSlug,
  moduleName,
  canJoinLive,
}: StudentDashboardHeroProps) {
  const reduce = useReducedMotion();
  const firstName = name.split(" ")[0] ?? name;
  const category = getProgramCategory(programSlug);
  const programTitle = getProgramBySlug(programSlug)?.title ?? category?.title ?? "Your course";
  const schedule = getStudentClassSchedule(programSlug);

  return (
    <motion.section
      className="student-hero-card"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="student-hero-orb student-hero-orb-a" aria-hidden />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <ProgramCategoryBadge programSlug={programSlug} variant="onDark" />
              {canJoinLive ? (
                <span className="student-badge-live rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                  Live classes active
                </span>
              ) : (
                <span className="student-badge-pending rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                  Module starts soon
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold tracking-tight text-white leading-[1.08]">
                {firstName}
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 mt-2.5 leading-relaxed">
                {programTitle}
                {moduleName ? (
                  <>
                    <span className="text-[#c9a84c]/80 mx-2">·</span>
                    {moduleName}
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            {canJoinLive ? (
              <Button
                size="lg"
                asChild
                className="student-cta-glow bg-[#c9a84c] text-[#0a0a0b] hover:bg-[#dbb85a] border-0 font-semibold shadow-lg shadow-black/30"
              >
                <Link href="/student/classes">
                  <VideoCamera size={18} weight="duotone" />
                  Join Live Class
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                asChild
                className="bg-white/[0.08] text-white border border-white/12 hover:bg-white/[0.12]"
              >
                <Link href="/student/classes">
                  <CalendarBlank size={18} weight="duotone" />
                  View Schedule
                </Link>
              </Button>
            )}
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="text-zinc-300 hover:text-[#dbb85a] hover:bg-white/[0.06]"
            >
              <Link href="/student/course">
                <BookOpen size={18} weight="duotone" />
                My Course
              </Link>
            </Button>
          </div>
        </div>

        <div className="student-hero-status mt-6 -mx-6 sm:-mx-8 lg:-mx-10 px-6 sm:px-8 lg:px-10 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5 text-[#dbb85a] font-medium">
            <CalendarBlank size={16} weight="duotone" />
            {schedule.headline}
          </span>
          <span className="text-zinc-500">{schedule.daysLabel}</span>
          {!canJoinLive && (
            <span className="text-zinc-500 text-xs sm:ml-auto">
              Your module batch opens next — we&apos;ll notify you on WhatsApp.
            </span>
          )}
        </div>
      </div>
    </motion.section>
  );
}
