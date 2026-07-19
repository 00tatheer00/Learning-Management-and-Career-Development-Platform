import Image from "next/image";
import { cn } from "@/lib/utils";
import { getProgramAccent } from "@/lib/constants/program-accents";
import type { Trainer } from "@/types";

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
        pillText: "text-slate-600 dark:text-slate-300",
        pillBg: "bg-slate-50/50 dark:bg-slate-900/30",
        lineBg: "bg-slate-500",
        glow: "group-hover:shadow-slate-500/10",
      };
    case "app-development":
      return {
        text: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-600",
        border: "border-indigo-200/60 dark:border-indigo-850/40",
        pillText: "text-indigo-600 dark:text-indigo-300",
        pillBg: "bg-indigo-50/50 dark:bg-indigo-950/20",
        lineBg: "bg-indigo-600",
        glow: "group-hover:shadow-indigo-500/15",
      };
    case "graphics-designing":
      return {
        text: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-600",
        border: "border-rose-200/60 dark:border-rose-850/40",
        pillText: "text-rose-600 dark:text-rose-300",
        pillBg: "bg-rose-50/50 dark:bg-rose-950/20",
        lineBg: "bg-rose-600",
        glow: "group-hover:shadow-rose-500/15",
      };
    case "digital-marketing":
      return {
        text: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-600",
        border: "border-emerald-200/60 dark:border-emerald-850/40",
        pillText: "text-emerald-600 dark:text-emerald-300",
        pillBg: "bg-emerald-50/50 dark:bg-emerald-950/20",
        lineBg: "bg-emerald-600",
        glow: "group-hover:shadow-emerald-500/15",
      };
    case "video-editing":
      return {
        text: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-600",
        border: "border-amber-200/60 dark:border-amber-850/40",
        pillText: "text-amber-600 dark:text-amber-300",
        pillBg: "bg-amber-50/50 dark:bg-amber-950/20",
        lineBg: "bg-amber-600",
        glow: "group-hover:shadow-amber-500/15",
      };
    case "artificial-intelligence":
      return {
        text: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-600",
        border: "border-purple-200/60 dark:border-purple-850/40",
        pillText: "text-purple-600 dark:text-purple-300",
        pillBg: "bg-purple-50/50 dark:bg-purple-950/20",
        lineBg: "bg-purple-600",
        glow: "group-hover:shadow-purple-500/15",
      };
    case "ui-ux-design":
      return {
        text: "text-cyan-600 dark:text-cyan-400",
        bg: "bg-cyan-600",
        border: "border-cyan-200/60 dark:border-cyan-850/40",
        pillText: "text-cyan-600 dark:text-cyan-300",
        pillBg: "bg-cyan-50/50 dark:bg-cyan-950/20",
        lineBg: "bg-cyan-600",
        glow: "group-hover:shadow-cyan-500/15",
      };
    default:
      return {
        text: "text-primary",
        bg: "bg-primary",
        border: "border-primary/20",
        pillText: "text-primary",
        pillBg: "bg-primary/5",
        lineBg: "bg-primary",
        glow: "group-hover:shadow-primary/20",
      };
  }
}

function TrainerPortrait({ trainer }: { trainer: Trainer }) {
  const accent = getAccent(trainer.programSlug);
  const initials = getInitials(trainer.name);
  const isLocalImage = trainer.image?.startsWith("/");

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface/50">
      {trainer.image ? (
        <Image
          src={trainer.image}
          alt={trainer.name}
          fill
          unoptimized={isLocalImage}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ objectPosition: trainer.imagePosition ?? "center top" }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={trainer.featured}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
            accent.gradient
          )}
        >
          {/* Decorative blur element behind initials */}
          <div className="absolute h-28 w-28 rounded-full bg-white/10 blur-xl opacity-75 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
          <span className="relative text-5xl font-extrabold tracking-tighter text-white/90 sm:text-6xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
            {initials}
          </span>
        </div>
      )}

      {/* Elegant dark overlay at bottom of portrait */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {trainer.experience && (
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.2em] text-white backdrop-blur-md shadow-lg">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {trainer.experience}
          </span>
        </div>
      )}
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
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-all duration-300 hover:scale-105",
            theme.border,
            theme.pillBg,
            theme.pillText
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
  skillLimit = 3,
  className,
}: TrainerCardProps) {
  const theme = getProgramColorTheme(trainer.programSlug);
  const skills = trainer.expertise.slice(0, skillLimit);
  const hiddenSkillCount = Math.max(trainer.expertise.length - skills.length, 0);

  return (
    <article
      className={cn(
        "group relative transition-all duration-500 hover:-translate-y-2",
        theme.glow,
        className
      )}
    >
      <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-background p-3 pb-4 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.12)] transition-all duration-500 group-hover:border-primary/20 group-hover:shadow-[0_30px_60px_-25px_rgba(15,23,42,0.18)]">
        <TrainerPortrait trainer={trainer} />

        <div className="space-y-4 px-2 pt-4">
          <div className="space-y-1.5">
            <div className={cn("h-1 w-8 rounded-full transition-all duration-500 ease-out group-hover:w-14", theme.lineBg)} />
            <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl transition-colors duration-300 group-hover:text-primary">
              {trainer.name}
            </h3>
            <p className={cn("text-xs font-bold uppercase tracking-wider", theme.text)}>
              {trainer.designation}
            </p>
          </div>

          {variant === "detailed" && (
            <p className="text-sm leading-relaxed text-muted-foreground">{trainer.bio}</p>
          )}

          <div className="space-y-2.5">
            <TrainerSkills skills={skills} theme={theme} />
            {hiddenSkillCount > 0 && (
              <p className="text-[10px] font-semibold text-muted-foreground/80 pl-1">
                +{hiddenSkillCount} more skills
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
