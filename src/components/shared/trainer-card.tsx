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
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface/50">
      {trainer.image ? (
        <Image
          src={trainer.image}
          alt={trainer.name}
          fill
          unoptimized={isLocalImage}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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

      {/* Elegant dark overlay at bottom of portrait */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

      {trainer.experience && (
        <div className="absolute left-4 top-4 z-10">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm shadow-sm">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
          className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500 transition-colors"
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
  const skills = trainer.expertise.slice(0, skillLimit);
  const hiddenSkillCount = Math.max(trainer.expertise.length - skills.length, 0);

  return (
    <article
      className={cn(
        "group relative transition-all duration-300 hover:-translate-y-1.5",
        className
      )}
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/60 bg-white p-4 pb-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <TrainerPortrait trainer={trainer} />

        <div className="space-y-4 pt-4 px-1">
          <div className="space-y-1.5">
            <div className="h-[3px] w-8 rounded-sm bg-indigo-600" />
            <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
              {trainer.name}
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              {trainer.designation}
            </p>
          </div>

          {variant === "detailed" && (
            <p className="text-sm leading-relaxed text-slate-500">{trainer.bio}</p>
          )}

          <div className="space-y-2.5">
            <TrainerSkills skills={skills} />
            {hiddenSkillCount > 0 && (
              <p className="text-[11px] font-medium text-slate-400">
                +{hiddenSkillCount} more skills
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
