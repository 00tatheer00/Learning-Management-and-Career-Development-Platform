"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, VideoCamera, FilmStrip, GraduationCap } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ProgramCategoryBadge } from "@/components/portal/program-category-badge";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { getProgramBySlug } from "@/lib/data/programs";
import { cn } from "@/lib/utils";

interface StudentDashboardHeroProps {
  name: string;
  programSlug: string;
  moduleName?: string | null;
  canJoinLive: boolean;
  materialsCount: number;
  assignmentsCount: number;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function StudentDashboardHero({
  name,
  programSlug,
  moduleName,
  canJoinLive,
  materialsCount,
  assignmentsCount,
}: StudentDashboardHeroProps) {
  const reduce = useReducedMotion();
  const firstName = name.split(" ")[0] ?? name;
  const category = getProgramCategory(programSlug);
  const programTitle = getProgramBySlug(programSlug)?.title ?? category?.title ?? "Your course";
  const heroVariant = programSlug === "app-development" ? "student-hero-app" : "student-hero-web";

  return (
    <motion.section
      className={cn("student-hero-card mb-6 p-6 sm:p-8 lg:p-10", heroVariant)}
      initial={reduce ? false : { opacity: 0, y: 22, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease }}
    >
      <div className="student-hero-orb student-hero-orb-a" aria-hidden />
      <div className="student-hero-orb student-hero-orb-b" aria-hidden />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-5">
          <motion.div
            className="flex flex-wrap items-center gap-2"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45, ease }}
          >
            <ProgramCategoryBadge programSlug={programSlug} variant="onDark" />
            {canJoinLive ? (
              <span className="student-badge-live student-pulse-soft rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Live classes active
              </span>
            ) : (
              <span className="student-badge-pending rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Module starts soon
              </span>
            )}
          </motion.div>
          <div>
            <motion.p
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-sky-200/70"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.4 }}
            >
              Welcome back
            </motion.p>
            <motion.h1
              className="mt-2 text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-white leading-[1.1]"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.55, ease }}
            >
              {firstName}
            </motion.h1>
            <motion.p
              className="text-sm sm:text-base text-slate-300/95 mt-3 max-w-xl leading-relaxed"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.45, ease }}
            >
              {programTitle}
              {moduleName ? ` · ${moduleName}` : ""}
            </motion.p>
          </div>
          <motion.div
            className="flex flex-wrap gap-2.5 pt-0.5"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.45, ease }}
          >
            {[
              { label: "Lessons", value: materialsCount },
              { label: "Tasks", value: assignmentsCount },
              { label: "Module", value: moduleName ?? "—" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/[0.12] px-4 py-2.5 text-center min-w-[5rem] shadow-sm"
                whileHover={reduce ? undefined : { y: -3, backgroundColor: "rgba(255,255,255,0.12)" }}
                transition={{ type: "spring", stiffness: 400, damping: 24, delay: i * 0.02 }}
              >
                <p className="text-[9px] uppercase tracking-[0.16em] text-sky-100/60 font-medium">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 font-semibold tabular-nums text-white",
                    typeof stat.value === "string" ? "text-sm truncate max-w-[7rem]" : "text-lg"
                  )}
                >
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="relative z-10 flex flex-wrap gap-2.5 shrink-0"
          initial={reduce ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease }}
        >
          {canJoinLive ? (
            <Button
              size="lg"
              asChild
              className="student-cta-glow bg-[#c9a84c] text-[#0b1b33] hover:bg-[#d4b55e] shadow-lg shadow-black/25 border-0 font-semibold"
            >
              <Link href="/student/classes">
                <VideoCamera size={18} weight="duotone" />
                Join Live Class
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="bg-white/[0.1] text-white border-white/15 hover:bg-white/[0.16]"
            >
              <Link href="/student/classes">View Schedule</Link>
            </Button>
          )}
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="bg-white/[0.08] text-slate-100 border-white/12 hover:bg-white/[0.14]"
          >
            <Link href="/student/course">
              <BookOpen size={18} weight="duotone" />
              My Course
            </Link>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="bg-white/[0.08] text-slate-100 border-white/12 hover:bg-white/[0.14]"
          >
            <Link href="/student/recordings">
              <FilmStrip size={18} weight="duotone" />
              Recordings
            </Link>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="bg-white/[0.08] text-slate-100 border-white/12 hover:bg-white/[0.14] hidden sm:inline-flex"
          >
            <Link href="/student/profile">
              <GraduationCap size={18} weight="duotone" />
              Profile
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
