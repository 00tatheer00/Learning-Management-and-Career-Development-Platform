"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getProgramAccent } from "@/lib/constants/program-accents";
import type { Trainer } from "@/types";
import {
  Monitor,
  DeviceMobile,
  Rocket,
  Palette,
  Megaphone,
  FilmStrip,
  Brain,
  LinkedinLogo,
  ArrowRight,
} from "@phosphor-icons/react";

interface TrainerCardProps {
  trainer: Trainer;
  variant?: "compact" | "detailed";
  skillLimit?: number;
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAccent(programSlug?: string) {
  if (!programSlug) {
    return {
      gradient: "from-orange-500 via-orange-600 to-orange-900",
      glow: "group-hover:shadow-primary/20",
    };
  }

  const accent = getProgramAccent(programSlug);
  return { gradient: accent.gradient, glow: accent.glow };
}

function getProgramColorTheme(slug?: string) {
  switch (slug) {
    case "web-development":
      return {
        text: "text-slate-650 dark:text-slate-400",
        bg: "bg-slate-500",
        border: "border-slate-200/60 dark:border-slate-800/40",
        pillText: "text-slate-600 dark:text-slate-300",
        pillBg: "bg-slate-100/80 dark:bg-slate-900/30",
        lineBg: "bg-[#FF5A26]",
        glow: "group-hover:shadow-slate-500/10",
      };
    case "app-development":
      return {
        text: "text-indigo-650 dark:text-indigo-400",
        bg: "bg-indigo-600",
        border: "border-indigo-200/60 dark:border-indigo-850/40",
        pillText: "text-indigo-600 dark:text-indigo-300",
        pillBg: "bg-slate-100/80 dark:bg-indigo-950/20",
        lineBg: "bg-[#FF5A26]",
        glow: "group-hover:shadow-indigo-500/15",
      };
    case "graphics-designing":
      return {
        text: "text-rose-650 dark:text-rose-400",
        bg: "bg-rose-600",
        border: "border-rose-200/60 dark:border-rose-850/40",
        pillText: "text-rose-600 dark:text-rose-300",
        pillBg: "bg-slate-100/80 dark:bg-rose-950/20",
        lineBg: "bg-[#FF5A26]",
        glow: "group-hover:shadow-rose-500/15",
      };
    case "digital-marketing":
      return {
        text: "text-emerald-650 dark:text-emerald-400",
        bg: "bg-emerald-600",
        border: "border-emerald-200/60 dark:border-emerald-850/40",
        pillText: "text-emerald-650 dark:text-emerald-300",
        pillBg: "bg-slate-100/80 dark:bg-emerald-950/20",
        lineBg: "bg-[#FF5A26]",
        glow: "group-hover:shadow-emerald-500/15",
      };
    case "video-editing":
      return {
        text: "text-amber-650 dark:text-amber-400",
        bg: "bg-amber-600",
        border: "border-amber-200/60 dark:border-amber-850/40",
        pillText: "text-amber-600 dark:text-amber-300",
        pillBg: "bg-slate-100/80 dark:bg-amber-950/20",
        lineBg: "bg-[#FF5A26]",
        glow: "group-hover:shadow-amber-500/15",
      };
    case "artificial-intelligence":
      return {
        text: "text-purple-650 dark:text-purple-400",
        bg: "bg-purple-600",
        border: "border-purple-200/60 dark:border-purple-850/40",
        pillText: "text-purple-600 dark:text-purple-300",
        pillBg: "bg-slate-100/80 dark:bg-purple-950/20",
        lineBg: "bg-[#FF5A26]",
        glow: "group-hover:shadow-purple-500/15",
      };
    case "ui-ux-design":
      return {
        text: "text-cyan-650 dark:text-cyan-400",
        bg: "bg-cyan-600",
        border: "border-cyan-200/60 dark:border-cyan-850/40",
        pillText: "text-cyan-600 dark:text-cyan-300",
        pillBg: "bg-slate-100/80 dark:bg-cyan-950/20",
        lineBg: "bg-[#FF5A26]",
        glow: "group-hover:shadow-cyan-500/15",
      };
    default:
      return {
        text: "text-primary",
        bg: "bg-primary",
        border: "border-primary/20",
        pillText: "text-primary",
        pillBg: "bg-slate-100/80",
        lineBg: "bg-[#FF5A26]",
        glow: "group-hover:shadow-primary/20",
      };
  }
}

function TrainerCategoryIcon({
  trainerId,
  programSlug,
  theme,
}: {
  trainerId: string;
  programSlug?: string;
  theme: ReturnType<typeof getProgramColorTheme>;
}) {
  const iconProps = { size: 16, className: "text-[#FF5A26]" };
  
  if (trainerId === "trainer-tatheer") {
    return <span className="text-xs font-extrabold tracking-tighter text-[#FF5A26]">{"</>"}</span>;
  }
  if (trainerId === "trainer-muhammad-ali") {
    return <Monitor {...iconProps} weight="bold" />;
  }
  if (trainerId === "trainer-talha") {
    return <DeviceMobile {...iconProps} weight="bold" />;
  }
  if (trainerId === "trainer-faras") {
    return <Rocket {...iconProps} weight="bold" />;
  }
  
  switch (programSlug) {
    case "web-development":
      return <span className="text-xs font-extrabold tracking-tighter text-[#FF5A26]">{"</>"}</span>;
    case "app-development":
      return <DeviceMobile {...iconProps} weight="bold" />;
    case "graphics-designing":
      return <Palette {...iconProps} weight="bold" />;
    case "digital-marketing":
      return <Megaphone {...iconProps} weight="bold" />;
    case "video-editing":
      return <FilmStrip {...iconProps} weight="bold" />;
    case "artificial-intelligence":
      return <Brain {...iconProps} weight="bold" />;
    default:
      return <span className="text-xs font-extrabold tracking-tighter text-[#FF5A26]">{"</>"}</span>;
  }
}

function TrainerAvatar({
  trainer,
  theme,
  accent,
  initials,
}: {
  trainer: Trainer;
  theme: ReturnType<typeof getProgramColorTheme>;
  accent: ReturnType<typeof getAccent>;
  initials: string;
}) {
  const isLocalImage = trainer.image?.startsWith("/");

  return (
    <div className="relative w-36 h-36 flex items-center justify-center mx-auto mb-5">
      {/* Concentric dashed ring track */}
      <div className="absolute inset-0 rounded-full border border-dashed border-slate-200 dark:border-slate-800/80" />
      
      {/* Dynamic spinning accent arc */}
      <div className={cn(
        "absolute inset-0 rounded-full border border-transparent border-t-[#FF5A26]/30 border-r-[#FF5A26]/30 animate-[spin_25s_linear_infinite] pointer-events-none",
        trainer.programSlug === "app-development" && "border-t-indigo-500/30 border-r-indigo-500/30",
        trainer.programSlug === "graphics-designing" && "border-t-rose-500/30 border-r-rose-500/30",
        trainer.programSlug === "digital-marketing" && "border-t-emerald-500/30 border-r-emerald-500/30",
        trainer.programSlug === "video-editing" && "border-t-amber-500/30 border-r-amber-500/30",
        trainer.programSlug === "artificial-intelligence" && "border-t-purple-500/30 border-r-purple-500/30",
        trainer.programSlug === "ui-ux-design" && "border-t-cyan-500/30 border-r-cyan-500/30"
      )} />
      
      {/* Orbital accent dot */}
      <div className="absolute w-2.5 h-2.5 rounded-full top-3 right-3 shadow-sm bg-[#FF5A26]" />

      {/* Profile picture */}
      <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-surface/50 shadow-md transition-transform duration-500 group-hover:scale-105">
        {trainer.image ? (
          <Image
            src={trainer.image}
            alt={trainer.name}
            fill
            unoptimized={isLocalImage}
            className="object-cover"
            style={{ objectPosition: trainer.imagePosition ?? "center top" }}
            sizes="112px"
          />
        ) : (
          <div className={cn("absolute inset-0 flex items-center justify-center bg-gradient-to-br", accent.gradient)}>
            <span className="relative text-3xl font-extrabold tracking-tighter text-white/95">
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Floating category badge icon on bottom right */}
      <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex items-center justify-center shadow-md z-10 transition-all duration-355 group-hover:scale-110">
        <TrainerCategoryIcon trainerId={trainer.id} programSlug={trainer.programSlug} theme={theme} />
      </div>
    </div>
  );
}

function TrainerSkills({ skills }: { skills: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-full bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-350 border-none transition-colors duration-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

export function TrainerCard({
  trainer,
  variant = "compact",
  skillLimit = 6,
  className,
}: TrainerCardProps) {
  const accent = getAccent(trainer.programSlug);
  const theme = getProgramColorTheme(trainer.programSlug);
  const initials = getInitials(trainer.name);
  const skills = trainer.expertise.slice(0, skillLimit);
  const hiddenSkillCount = Math.max(trainer.expertise.length - skills.length, 0);

  return (
    <article
      className={cn(
        "group relative transition-all duration-500 hover:-translate-y-2",
        className
      )}
    >
      <div className="overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-950 px-6 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-500 group-hover:border-primary/20 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative flex flex-col items-center">
        
        {/* Top Header Row: Experience Badge on left, LinkedIn on right */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full inline-block bg-[#FF5A26] animate-pulse" />
            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {trainer.experience || "3+ years"}
            </span>
          </div>
          
          <a
            href={trainer.social?.linkedin || "https://linkedin.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-slate-50/80 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 flex items-center justify-center text-slate-400 hover:text-[#0077B5] hover:bg-[#0077B5]/10 hover:border-[#0077B5]/20 transition-all duration-300"
            aria-label={`${trainer.name} LinkedIn`}
          >
            <LinkedinLogo size={14} weight="bold" />
          </a>
        </div>

        {/* Orbit avatar profile picture */}
        <TrainerAvatar trainer={trainer} theme={theme} accent={accent} initials={initials} />

        <div className="space-y-4 text-center mt-3 w-full">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-slate-850 dark:text-white sm:text-xl transition-colors duration-300 group-hover:text-primary">
              {trainer.name}
            </h3>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              {trainer.designation}
            </p>
            {/* Centered accent line below designation */}
            <div className="h-[2px] w-10 mx-auto bg-[#FF5A26] mt-3" />
          </div>

          {variant === "detailed" && (
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 text-left">{trainer.bio}</p>
          )}

          <div className="space-y-2.5">
            <TrainerSkills skills={skills} />
            {hiddenSkillCount > 0 && (
              <p className="text-[10px] font-semibold text-slate-400">
                +{hiddenSkillCount} more skills
              </p>
            )}
          </div>

          {/* Centered "VIEW PROFILE" Link */}
          <div className="pt-4 border-t border-slate-50/50 dark:border-slate-900 mt-2 flex justify-center w-full">
            <Link 
              href={`/programs/${trainer.programSlug}`} 
              className="inline-flex items-center justify-center gap-1.5 text-[10px] font-extrabold tracking-widest text-slate-700 dark:text-slate-300 hover:text-[#FF5A26] transition-all duration-300 group/btn"
              aria-label={`View ${trainer.name} profile`}
            >
              VIEW PROFILE
              <ArrowRight size={12} weight="bold" className="text-[#FF5A26] transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
