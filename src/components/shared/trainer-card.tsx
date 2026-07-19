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
        text: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-500",
        border: "border-slate-200/60 dark:border-slate-800/40",
        pillText: "text-slate-650 dark:text-slate-350",
        pillBg: "bg-slate-50/80 dark:bg-slate-900/40",
        lineBg: "bg-[#FF5A26]",
        pulseBg: "bg-[#FF5A26]",
        hoverText: "group-hover:text-[#FF5A26] dark:group-hover:text-[#FF5A26]",
        buttonText: "text-slate-700 dark:text-slate-300",
        iconColor: "text-[#FF5A26]",
        glow: "group-hover:shadow-[0_20px_50px_rgba(255,90,38,0.12)] dark:group-hover:shadow-[0_20px_50px_rgba(255,90,38,0.22)]",
      };
    case "app-development":
      return {
        text: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-600",
        border: "border-indigo-200/60 dark:border-indigo-850/40",
        pillText: "text-indigo-650 dark:text-indigo-350",
        pillBg: "bg-slate-50/80 dark:bg-indigo-950/20",
        lineBg: "bg-indigo-600",
        pulseBg: "bg-indigo-600",
        hoverText: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
        buttonText: "text-indigo-650 dark:text-indigo-350",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        glow: "group-hover:shadow-[0_20px_50px_rgba(99,102,241,0.12)] dark:group-hover:shadow-[0_20px_50px_rgba(99,102,241,0.22)]",
      };
    case "graphics-designing":
      return {
        text: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-600",
        border: "border-rose-200/60 dark:border-rose-850/40",
        pillText: "text-rose-650 dark:text-rose-350",
        pillBg: "bg-slate-50/80 dark:bg-rose-950/20",
        lineBg: "bg-rose-600",
        pulseBg: "bg-rose-600",
        hoverText: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
        buttonText: "text-rose-650 dark:text-rose-350",
        iconColor: "text-rose-600 dark:text-rose-400",
        glow: "group-hover:shadow-[0_20px_50px_rgba(244,63,94,0.12)] dark:group-hover:shadow-[0_20px_50px_rgba(244,63,94,0.22)]",
      };
    case "digital-marketing":
      return {
        text: "text-emerald-650 dark:text-emerald-400",
        bg: "bg-emerald-600",
        border: "border-emerald-200/60 dark:border-emerald-850/40",
        pillText: "text-emerald-650 dark:text-emerald-350",
        pillBg: "bg-slate-50/80 dark:bg-emerald-950/20",
        lineBg: "bg-emerald-600",
        pulseBg: "bg-emerald-600",
        hoverText: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
        buttonText: "text-emerald-650 dark:text-emerald-350",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        glow: "group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)] dark:group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.22)]",
      };
    case "video-editing":
      return {
        text: "text-amber-650 dark:text-amber-400",
        bg: "bg-amber-600",
        border: "border-amber-200/60 dark:border-amber-850/40",
        pillText: "text-amber-650 dark:text-amber-350",
        pillBg: "bg-slate-50/80 dark:bg-amber-950/20",
        lineBg: "bg-amber-600",
        pulseBg: "bg-amber-600",
        hoverText: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
        buttonText: "text-amber-650 dark:text-amber-400",
        iconColor: "text-amber-600 dark:text-amber-400",
        glow: "group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.12)] dark:group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.22)]",
      };
    case "artificial-intelligence":
      return {
        text: "text-purple-650 dark:text-purple-400",
        bg: "bg-purple-600",
        border: "border-purple-200/60 dark:border-purple-850/40",
        pillText: "text-purple-650 dark:text-purple-350",
        pillBg: "bg-slate-50/80 dark:bg-purple-950/20",
        lineBg: "bg-purple-600",
        pulseBg: "bg-purple-600",
        hoverText: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
        buttonText: "text-purple-650 dark:text-purple-400",
        iconColor: "text-purple-600 dark:text-purple-400",
        glow: "group-hover:shadow-[0_20px_50px_rgba(139,92,246,0.12)] dark:group-hover:shadow-[0_20px_50px_rgba(139,92,246,0.22)]",
      };
    case "ui-ux-design":
      return {
        text: "text-cyan-650 dark:text-cyan-400",
        bg: "bg-cyan-600",
        border: "border-cyan-200/60 dark:border-cyan-850/40",
        pillText: "text-cyan-650 dark:text-cyan-350",
        pillBg: "bg-slate-50/80 dark:bg-cyan-950/20",
        lineBg: "bg-cyan-600",
        pulseBg: "bg-cyan-600",
        hoverText: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
        buttonText: "text-cyan-650 dark:text-cyan-400",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        glow: "group-hover:shadow-[0_20px_50px_rgba(6,182,212,0.12)] dark:group-hover:shadow-[0_20px_50px_rgba(6,182,212,0.22)]",
      };
    default:
      return {
        text: "text-primary",
        bg: "bg-primary",
        border: "border-primary/20",
        pillText: "text-primary",
        pillBg: "bg-slate-100/80",
        lineBg: "bg-[#FF5A26]",
        pulseBg: "bg-[#FF5A26]",
        hoverText: "group-hover:text-[#FF5A26] dark:group-hover:text-[#FF5A26]",
        buttonText: "text-slate-700 dark:text-slate-300",
        iconColor: "text-[#FF5A26]",
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
  const iconProps = { size: 16, className: cn(theme.iconColor || "text-[#FF5A26]") };
  
  if (trainerId === "trainer-tatheer") {
    return <span className={cn("text-xs font-extrabold tracking-tighter", theme.iconColor || "text-[#FF5A26]")}>{"</>"}</span>;
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
      return <span className={cn("text-xs font-extrabold tracking-tighter", theme.iconColor || "text-[#FF5A26]")}>{"</>"}</span>;
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
      return <span className={cn("text-xs font-extrabold tracking-tighter", theme.iconColor || "text-[#FF5A26]")}>{"</>"}</span>;
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
    <div className="relative w-36 h-36 flex items-center justify-center mx-auto mb-6">
      {/* Rotating outer dotted ring */}
      <div className="absolute inset-0 rounded-full border border-dashed border-slate-200/80 dark:border-slate-800/80 animate-[spin_50s_linear_infinite] pointer-events-none" />
      
      {/* Glowing gradient aura behind avatar (fades in on hover) */}
      <div className={cn(
        "absolute inset-3 rounded-full opacity-0 group-hover:opacity-25 blur-md transition-all duration-500 bg-gradient-to-tr",
        accent.gradient
      )} />

      {/* Dynamic spinning accent arc */}
      <div className={cn(
        "absolute inset-0.5 rounded-full border border-transparent border-t-[#FF5A26]/40 border-r-[#FF5A26]/40 animate-[spin_12s_linear_infinite] pointer-events-none transition-all duration-500 group-hover:scale-105",
        trainer.programSlug === "app-development" && "border-t-indigo-500/40 border-r-indigo-500/40",
        trainer.programSlug === "graphics-designing" && "border-t-rose-500/40 border-r-rose-500/40",
        trainer.programSlug === "digital-marketing" && "border-t-emerald-500/40 border-r-emerald-500/40",
        trainer.programSlug === "video-editing" && "border-t-amber-500/40 border-r-amber-500/40",
        trainer.programSlug === "artificial-intelligence" && "border-t-purple-500/40 border-r-purple-500/40",
        trainer.programSlug === "ui-ux-design" && "border-t-cyan-500/40 border-r-cyan-500/40"
      )} />

      {/* Orbital accent dot */}
      <div className={cn("absolute w-2.5 h-2.5 rounded-full top-3 right-3 shadow-md transition-all duration-500 group-hover:scale-110", theme.lineBg || "bg-[#FF5A26]")} />

      {/* Profile picture inside gradient ring */}
      <div className={cn(
        "relative w-28 h-28 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-50 dark:bg-slate-950 shadow-md transition-all duration-500 group-hover:scale-[1.03] group-hover:border-primary/20",
        "p-[2.5px] bg-gradient-to-tr",
        accent.gradient
      )}>
        <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-50 dark:bg-slate-950">
          {trainer.image ? (
            <Image
              src={trainer.image}
              alt={trainer.name}
              fill
              unoptimized={isLocalImage}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              style={{ objectPosition: trainer.imagePosition ?? "center top" }}
              sizes="112px"
            />
          ) : (
            <div className={cn("absolute inset-0 flex items-center justify-center bg-gradient-to-br", accent.gradient)}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_50%)]" />
              <span className="relative text-3xl font-extrabold tracking-tighter text-white/95 drop-shadow-sm">
                {initials}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating category badge icon on bottom right */}
      <div className={cn(
        "absolute bottom-2.5 right-2.5 w-8.5 h-8.5 rounded-full bg-white dark:bg-slate-950 border flex items-center justify-center shadow-md z-10 transition-all duration-500 group-hover:scale-115 group-hover:rotate-12",
        theme.border || "border-slate-100 dark:border-slate-900"
      )}>
        <TrainerCategoryIcon trainerId={trainer.id} programSlug={trainer.programSlug} theme={theme} />
      </div>
    </div>
  );
}

function TrainerSkills({
  skills,
  theme,
}: {
  skills: string[];
  theme: ReturnType<typeof getProgramColorTheme>;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto">
      {skills.map((skill) => (
        <span
          key={skill}
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-medium border transition-all duration-300 hover:scale-105",
            theme.pillBg || "bg-slate-100/80 dark:bg-slate-800/80",
            theme.pillText || "text-slate-600 dark:text-slate-350",
            theme.border || "border-none",
            "hover:bg-primary/5 hover:text-primary hover:border-primary/20 dark:hover:bg-primary/10"
          )}
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
        "group relative transition-all duration-500 hover:-translate-y-2.5",
        className
      )}
    >
      {/* Background glow shadow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10",
        trainer.programSlug === "web-development" && "bg-orange-500/10",
        trainer.programSlug === "app-development" && "bg-indigo-500/10",
        trainer.programSlug === "graphics-designing" && "bg-rose-500/10",
        trainer.programSlug === "digital-marketing" && "bg-emerald-500/10",
        trainer.programSlug === "video-editing" && "bg-amber-500/10",
        trainer.programSlug === "artificial-intelligence" && "bg-purple-500/10",
        trainer.programSlug === "ui-ux-design" && "bg-cyan-500/10"
      )} />

      <div className={cn(
        "overflow-hidden rounded-[2rem] border bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900/60 px-6 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-all duration-500 relative flex flex-col items-center",
        theme.border || "border-slate-100 dark:border-slate-800/60",
        theme.glow
      )}>
        
        {/* Top Header Row: Experience Badge on left, LinkedIn on right */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800/80 shadow-sm">
            <span className={cn("w-1.5 h-1.5 rounded-full inline-block animate-pulse", theme.pulseBg || "bg-[#FF5A26]")} />
            <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
              {trainer.experience || "3+ years"}
            </span>
          </div>
          
          <a
            href={trainer.social?.linkedin || "https://linkedin.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-slate-50/80 dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800/80 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-[#0077B5] hover:border-[#0077B5] shadow-sm transition-all duration-300 hover:scale-110"
            aria-label={`${trainer.name} LinkedIn`}
          >
            <LinkedinLogo size={14} weight="bold" />
          </a>
        </div>

        {/* Orbit avatar profile picture */}
        <TrainerAvatar trainer={trainer} theme={theme} accent={accent} initials={initials} />

        <div className="space-y-4 text-center mt-3 w-full">
          <div className="space-y-1">
            <h3 className={cn(
              "text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-xl transition-colors duration-300",
              theme.hoverText
            )}>
              {trainer.name}
            </h3>
            <p className="text-[10px] font-bold tracking-wide uppercase text-muted-foreground">
              {trainer.designation}
            </p>
            {/* Animated accent line below designation that expands on hover */}
            <div className={cn(
              "h-[2.5px] w-8 mx-auto rounded-full mt-3.5 transition-all duration-500 group-hover:w-16",
              theme.lineBg || "bg-[#FF5A26]"
            )} />
          </div>

          {variant === "detailed" && (
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 text-left">{trainer.bio}</p>
          )}

          <div className="space-y-2.5">
            <TrainerSkills skills={skills} theme={theme} />
            {hiddenSkillCount > 0 && (
              <p className="text-[10px] font-semibold text-muted-foreground">
                +{hiddenSkillCount} more skills
              </p>
            )}
          </div>

          {/* Interactive "View Profile" Link in footer */}
          <div className="pt-4 border-t border-slate-100/60 dark:border-slate-900/60 mt-3 flex justify-center w-full">
            <Link 
              href={`/programs/${trainer.programSlug}`} 
              className={cn(
                "inline-flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-350 group/btn",
                theme.buttonText || "text-slate-700 dark:text-slate-350",
                "hover:text-[#FF5A26] dark:hover:text-[#FF5A26]"
              )}
              aria-label={`View ${trainer.name} profile`}
            >
              View Profile
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-900 group-hover/btn:bg-[#FF5A26]/10 group-hover/btn:text-[#FF5A26] transition-colors duration-300">
                <ArrowRight size={10} weight="bold" className="transition-transform duration-300 group-hover/btn:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
