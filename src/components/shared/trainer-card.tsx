import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Trainer } from "@/types";

const PROGRAM_ACCENTS: Record<string, { gradient: string; glow: string }> = {
  "web-development": {
    gradient: "from-slate-700 via-slate-800 to-slate-950",
    glow: "group-hover:shadow-slate-900/20",
  },
  "app-development": {
    gradient: "from-indigo-600 via-violet-700 to-indigo-950",
    glow: "group-hover:shadow-indigo-600/20",
  },
  "graphics-designing": {
    gradient: "from-rose-500 via-pink-600 to-rose-900",
    glow: "group-hover:shadow-rose-500/20",
  },
  "digital-marketing": {
    gradient: "from-emerald-500 via-teal-600 to-emerald-900",
    glow: "group-hover:shadow-emerald-500/20",
  },
  "video-editing": {
    gradient: "from-amber-500 via-orange-600 to-amber-900",
    glow: "group-hover:shadow-amber-500/20",
  },
  "artificial-intelligence": {
    gradient: "from-violet-600 via-purple-700 to-violet-950",
    glow: "group-hover:shadow-violet-600/20",
  },
};

const DEFAULT_ACCENT = {
  gradient: "from-orange-500 via-orange-600 to-orange-900",
  glow: "group-hover:shadow-primary/20",
};

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
  if (!programSlug) return DEFAULT_ACCENT;
  return PROGRAM_ACCENTS[programSlug] ?? DEFAULT_ACCENT;
}

function TrainerPortrait({ trainer, tall = false }: { trainer: Trainer; tall?: boolean }) {
  const accent = getAccent(trainer.programSlug);
  const initials = getInitials(trainer.name);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface",
        tall ? "aspect-[4/5]" : "aspect-[5/6]"
      )}
    >
      {trainer.image ? (
        <Image
          src={trainer.image}
          alt={trainer.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ objectPosition: trainer.imagePosition ?? "center" }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
            accent.gradient
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
          <span className="relative text-5xl font-bold tracking-tight text-white/90 sm:text-6xl">
            {initials}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {trainer.experience && (
        <div className="absolute left-4 top-4 z-10">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {trainer.experience}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 pt-20">
        <div className="mb-3 h-1 w-10 rounded-full bg-primary shadow-[0_0_12px_rgba(234,88,12,0.65)]" />
        <h3 className="text-xl font-bold leading-tight text-white sm:text-[1.35rem]">
          {trainer.name}
        </h3>
        <p className="mt-1.5 text-sm font-medium text-white/75">{trainer.designation}</p>
      </div>
    </div>
  );
}

function TrainerSkills({ skills }: { skills: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-lg border border-border/60 bg-surface/80 px-2.5 py-1 text-[11px] font-semibold text-muted"
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
  const accent = getAccent(trainer.programSlug);
  const skills = trainer.expertise.slice(0, skillLimit);
  const hiddenSkillCount = Math.max(trainer.expertise.length - skills.length, 0);

  return (
    <article
      className={cn(
        "group relative transition-all duration-500 hover:-translate-y-2",
        accent.glow,
        className
      )}
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-[0_12px_40px_-18px_rgba(15,23,42,0.35)] transition-all duration-500 group-hover:border-primary/25 group-hover:shadow-[0_28px_60px_-24px_rgba(234,88,12,0.28)]">
        <TrainerPortrait trainer={trainer} tall={variant === "detailed"} />

        <div className="space-y-4 border-t border-border/60 bg-background p-4 sm:p-5">
          {variant === "detailed" && (
            <p className="text-sm leading-relaxed text-muted">{trainer.bio}</p>
          )}

          <div className="space-y-2">
            <TrainerSkills skills={skills} />
            {hiddenSkillCount > 0 && (
              <p className="text-[11px] font-medium text-muted">+{hiddenSkillCount} more skills</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
