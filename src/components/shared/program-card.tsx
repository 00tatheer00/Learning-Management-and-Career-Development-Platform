"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Code,
  DeviceMobile,
  FilmStrip,
  Layout,
  Megaphone,
  PaintBrushBroad,
  CalendarDots,
  ListBullets,
  Stack,
  Certificate,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { getProgramAccent } from "@/lib/constants/program-accents";
import { getProgramTopicCount, programHasSyllabus } from "@/lib/data/programs";
import { MODULE_CERTIFICATE_SHORT } from "@/lib/constants/program-marketing";
import type { Program } from "@/types";

const PROGRAM_ICONS: Record<string, Icon> = {
  "web-development": Code,
  "app-development": DeviceMobile,
  "artificial-intelligence": Brain,
  "video-editing": FilmStrip,
  "digital-marketing": Megaphone,
  "graphics-designing": PaintBrushBroad,
  "ui-ux-design": Layout,
};

interface ProgramCardProps {
  program: Program;
  className?: string;
}

export function ProgramCard({ program, className }: ProgramCardProps) {
  const accent = getProgramAccent(program.slug);
  const Icon = PROGRAM_ICONS[program.slug] ?? Code;
  const isActive = program.category === "active";
  const topicCount = getProgramTopicCount(program);
  const hasSyllabus = programHasSyllabus(program);

  return (
    <Link
      href={`/programs/${program.slug}`}
      className={cn(
        "group relative block h-full transition-all duration-500 hover:-translate-y-2",
        className
      )}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 dark:border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl transition-all duration-500 group-hover:border-orange-500/50 group-hover:shadow-2xl group-hover:shadow-orange-500/20">
        <div className="relative min-h-[200px] overflow-hidden px-6 pb-6 pt-6 sm:min-h-[220px]">
          {program.image && (
            <Image
              src={program.image}
              alt=""
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              aria-hidden="true"
            />
          )}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90"
            )}
          />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 backdrop-blur-md shadow-lg">
              <Icon size={24} weight="duotone" aria-hidden="true" />
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em]",
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30"
                  : "border border-white/20 bg-white/10 text-slate-300 backdrop-blur-md"
              )}
            >
              {isActive ? "Enrolling Now" : "Coming Soon"}
            </span>
          </div>

          <div className="relative z-10 mt-6">
            <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">{program.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300">
              {program.description}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6 bg-slate-900/90 text-white">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              <CalendarDots size={14} weight="duotone" className="text-orange-400" aria-hidden="true" />
              {program.duration}
            </span>
            {program.modules.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                <Stack size={14} weight="duotone" className="text-orange-400" aria-hidden="true" />
                {program.modules.length} modules
              </span>
            )}
            {hasSyllabus && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                <ListBullets size={14} weight="duotone" aria-hidden="true" />
                {topicCount} topics
              </span>
            )}
            {program.modules.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Certificate size={14} weight="duotone" aria-hidden="true" />
                {MODULE_CERTIFICATE_SHORT}
              </span>
            )}
          </div>

          {program.modules.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Modules
              </p>
              <div className="flex flex-wrap gap-1.5">
                {program.modules.map((mod, index) => (
                  <span
                    key={mod.name}
                    className="rounded-xl border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium text-slate-200"
                  >
                    {index + 1}. {mod.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {program.outcomes.slice(0, 2).map((outcome) => (
              <li key={outcome} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                <span className="line-clamp-2">{outcome}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-sm font-bold text-orange-400 group-hover:text-orange-300">
            <span>{isActive ? "View Program" : "Explore Program"}</span>
            <ArrowRight
              size={18}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
