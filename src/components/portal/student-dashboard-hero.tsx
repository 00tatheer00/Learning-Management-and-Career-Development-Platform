"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  VideoCamera,
  CalendarBlank,
  GraduationCap,
  Sparkle,
} from "@phosphor-icons/react";
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
      className="student-glass-welcome relative overflow-hidden rounded-3xl"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease }}
    >
      <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <ProgramCategoryBadge programSlug={programSlug} variant="onDark" />
            {canJoinLive ? (
              <span className="student-badge-live rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Live now
              </span>
            ) : (
              <span className="student-badge-pending rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Starting soon
              </span>
            )}
          </div>

          <div>
            <p className="text-sm text-zinc-400 font-medium">Welcome back,</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white mt-0.5">
              {firstName}!
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-2 leading-relaxed">
              {canJoinLive
                ? "Your classes are live — join from the portal or check what’s next below."
                : `${schedule.headline} · ${schedule.daysLabel}`}
            </p>
            {moduleName && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#dbb85a]">
                <GraduationCap size={14} weight="duotone" />
                {programTitle} · {moduleName}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {canJoinLive ? (
              <Button
                size="lg"
                asChild
                className="student-cta-glow rounded-xl bg-[#c9a84c] text-[#0a0a0b] hover:bg-[#dbb85a] border-0 font-semibold"
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
                className="rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/14 backdrop-blur-sm"
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
              className="rounded-xl text-zinc-300 hover:text-[#dbb85a] hover:bg-white/6"
            >
              <Link href="/student/course">
                <BookOpen size={18} weight="duotone" />
                My Course
              </Link>
            </Button>
          </div>
        </div>

        <div className="hidden sm:flex shrink-0 items-center justify-center">
          <div className="student-welcome-orb relative flex h-28 w-28 lg:h-32 lg:w-32 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            <Sparkle size={48} weight="duotone" className="text-[#c9a84c]/80" />
            <div className="absolute -right-2 -top-2 h-10 w-10 rounded-2xl bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center">
              <BookOpen size={20} weight="duotone" className="text-[#dbb85a]" />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
