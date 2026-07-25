"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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

const PROGRAM_THEMES: Record<string, { badge: string; glow: string; borderHover: string; iconBg: string; textAccent: string }> = {
  "web-development": {
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    glow: "shadow-cyan-500/10",
    borderHover: "group-hover:border-cyan-500/50",
    iconBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    textAccent: "text-cyan-400",
  },
  "app-development": {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    glow: "shadow-emerald-500/10",
    borderHover: "group-hover:border-emerald-500/50",
    iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    textAccent: "text-emerald-400",
  },
  "artificial-intelligence": {
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    glow: "shadow-purple-500/10",
    borderHover: "group-hover:border-purple-500/50",
    iconBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    textAccent: "text-purple-400",
  },
  "video-editing": {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    glow: "shadow-amber-500/10",
    borderHover: "group-hover:border-amber-500/50",
    iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    textAccent: "text-amber-400",
  },
  "digital-marketing": {
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    glow: "shadow-rose-500/10",
    borderHover: "group-hover:border-rose-500/50",
    iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    textAccent: "text-rose-400",
  },
  "graphics-designing": {
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    glow: "shadow-pink-500/10",
    borderHover: "group-hover:border-pink-500/50",
    iconBg: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    textAccent: "text-pink-400",
  },
  "ui-ux-design": {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    glow: "shadow-blue-500/10",
    borderHover: "group-hover:border-blue-500/50",
    iconBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    textAccent: "text-blue-400",
  },
};

interface ProgramCardProps {
  program: Program;
  className?: string;
}

export function ProgramCard({ program, className }: ProgramCardProps) {
  const Icon = PROGRAM_ICONS[program.slug] ?? Code;
  const theme = PROGRAM_THEMES[program.slug] ?? PROGRAM_THEMES["web-development"];
  const isActive = program.category === "active";
  const topicCount = getProgramTopicCount(program);
  const hasSyllabus = programHasSyllabus(program);

  return (
    <Link
      href={`/programs/${program.slug}`}
      className={cn("group relative block h-full", className)}
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl transition-all duration-500 overflow-hidden relative",
          theme.borderHover,
          theme.glow
        )}
      >
        {/* Top Image Banner */}
        <div className="relative min-h-[200px] overflow-hidden px-6 pb-6 pt-6 sm:min-h-[220px]">
          {program.image && (
            <Image
              src={program.image}
              alt={program.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              aria-hidden="true"
            />
          )}

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />

          {/* Header Row */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            <span className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl border backdrop-blur-md shadow-lg transition-transform duration-300 group-hover:scale-110", theme.iconBg)}>
              <Icon size={26} weight="duotone" aria-hidden="true" />
            </span>

            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] backdrop-blur-md shadow-sm",
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400/50 shadow-orange-500/30"
                  : "bg-white/10 text-slate-300 border-white/20"
              )}
            >
              {isActive ? "🔥 Enrolling Now" : "Coming Soon"}
            </span>
          </div>

          {/* Program Title & Short Description */}
          <div className="relative z-10 mt-6">
            <h3 className={cn("text-2xl font-black tracking-tight text-white transition-colors duration-300", "group-hover:" + theme.textAccent)}>
              {program.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300">
              {program.description}
            </p>
          </div>
        </div>

        {/* Card Content Footer */}
        <div className="flex flex-1 flex-col gap-5 p-6 bg-slate-950/80 text-white border-t border-white/5">
          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              <CalendarDots size={14} weight="duotone" className="text-orange-400" />
              {program.duration}
            </span>
            {program.modules.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                <Stack size={14} weight="duotone" className="text-amber-400" />
                {program.modules.length} modules
              </span>
            )}
            {hasSyllabus && (
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold", theme.badge)}>
                <ListBullets size={14} weight="duotone" />
                {topicCount} topics
              </span>
            )}
            {program.modules.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                <Certificate size={14} weight="duotone" />
                {MODULE_CERTIFICATE_SHORT}
              </span>
            )}
          </div>

          {/* Module List Pills */}
          {program.modules.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Course Modules
              </p>
              <div className="flex flex-wrap gap-1.5">
                {program.modules.map((mod, index) => (
                  <span
                    key={mod.name}
                    className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-slate-200 group-hover:border-white/20 transition-colors"
                  >
                    {index + 1}. {mod.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Course Outcomes */}
          <ul className="space-y-2">
            {program.outcomes.slice(0, 2).map((outcome) => (
              <li key={outcome} className="flex items-start gap-2.5 text-xs text-slate-300">
                <Sparkles className="w-3.5 h-3.5 mt-0.5 text-orange-400 shrink-0" />
                <span className="line-clamp-2">{outcome}</span>
              </li>
            ))}
          </ul>

          {/* Bottom Card Action */}
          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-xs font-extrabold uppercase tracking-wider text-orange-400 group-hover:text-orange-300">
            <span>{isActive ? "Explore Syllabus" : "View Program"}</span>
            <ArrowRight
              size={16}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-1.5"
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
