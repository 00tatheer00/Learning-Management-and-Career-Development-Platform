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

function TrainerPortrait({ trainer }: { trainer: Trainer }) {
  const accent = getAccent(trainer.programSlug);
  const initials = getInitials(trainer.name);
  const isLocalImage = trainer.image?.startsWith("/");

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
      {trainer.image ? (
        <Image
          src={trainer.image}
          alt={trainer.name}
          fill
          unoptimized={isLocalImage}
          className="object-cover"
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
          <span className="relative text-5xl font-bold tracking-tight text-white/90 sm:text-6xl">
            {initials}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

      {trainer.experience && (
        <div className="absolute left-4 top-4 z-10">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {trainer.experience}
          </span>
        </div>
      )}
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
        <TrainerPortrait trainer={trainer} />

        <div className="space-y-4 border-t border-border/60 bg-background p-4 sm:p-5">
          <div>
            <div className="mb-2 h-1 w-10 rounded-full bg-primary" />
            <h3 className="text-lg font-bold tracking-tight sm:text-xl">{trainer.name}</h3>
            <p className="mt-1 text-sm font-semibold text-primary">{trainer.designation}</p>
          </div>

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
