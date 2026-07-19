import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getProgramAccent } from "@/lib/constants/program-accents";
import { ArrowRight } from "lucide-react";
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

/* ------------------------------------------------------------------ */
/*  Portrait                                                          */
/* ------------------------------------------------------------------ */

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
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
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

      {/* Subtle bottom vignette so white text is always legible */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {/* Experience pill */}
      {trainer.experience && (
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
            {trainer.experience}
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skill pills                                                       */
/* ------------------------------------------------------------------ */

function TrainerSkills({ skills }: { skills: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-md border border-border/50 bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card                                                              */
/* ------------------------------------------------------------------ */

export function TrainerCard({
  trainer,
  variant = "compact",
  skillLimit = 6,
  className,
}: TrainerCardProps) {
  const skills = trainer.expertise.slice(0, skillLimit);
  const hiddenSkillCount = Math.max(trainer.expertise.length - skills.length, 0);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/[0.04] hover:border-border",
        className
      )}
    >
      {/* Portrait */}
      <TrainerPortrait trainer={trainer} />

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3.5 p-5">
        {/* Name & role */}
        <div>
          <h3 className="text-base font-semibold tracking-tight sm:text-lg">
            {trainer.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-primary">
            {trainer.designation}
          </p>
        </div>

        {/* Bio (detailed variant only) */}
        {variant === "detailed" && (
          <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-3">
            {trainer.bio}
          </p>
        )}

        {/* Skills */}
        <div className="mt-auto space-y-1.5">
          <TrainerSkills skills={skills} />
          {hiddenSkillCount > 0 && (
            <p className="text-[10px] font-medium text-muted-foreground">
              +{hiddenSkillCount} more
            </p>
          )}
        </div>

        {/* View profile link */}
        <Link
          href={`/programs/${trainer.programSlug}`}
          className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/70 transition-colors duration-200 hover:text-primary group/link"
          aria-label={`View ${trainer.name}'s program`}
        >
          View Profile
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
