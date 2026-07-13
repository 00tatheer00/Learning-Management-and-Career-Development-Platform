import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Code,
  DeviceMobileCamera,
  GraduationCap,
  Star,
  User,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import {
  getSkillIconStyle,
  getTrainerExperienceLabel,
  getTrainerExpertiseHighlight,
  getTrainerHeadline,
  getTrainerRoleBadge,
  getTrainerShowcaseSkills,
  getTrainerStudentsTrained,
} from "@/lib/data/trainer-card-meta";
import type { Trainer } from "@/types";

interface TrainerCardProps {
  trainer: Trainer;
  variant?: "compact" | "detailed";
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

function getProgramIcon(programSlug?: string) {
  if (programSlug === "app-development") {
    return DeviceMobileCamera;
  }
  return Code;
}

function TrainerStatPill({
  icon: Icon,
  label,
}: {
  icon: typeof GraduationCap;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3 py-2 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] backdrop-blur-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={14} weight="duotone" aria-hidden="true" />
      </span>
      <span className="text-[11px] font-semibold leading-tight text-foreground">{label}</span>
    </div>
  );
}

export function TrainerCard({ trainer, variant = "compact", className }: TrainerCardProps) {
  const ProgramIcon = getProgramIcon(trainer.programSlug);
  const showcaseSkills = getTrainerShowcaseSkills(trainer);
  const isLocalImage = trainer.image?.startsWith("/");
  const showBio = variant === "detailed" || trainer.bio.length < 180;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_28px_60px_-24px_rgba(234,88,12,0.22)]",
        className
      )}
    >
      <div className="relative min-h-[300px] overflow-hidden bg-[#FFF4EC] sm:min-h-[320px]">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.35) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
            maskImage: "linear-gradient(90deg, black 0%, transparent 42%)",
          }}
        />

        <div className="absolute left-5 top-5 z-20">
          <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-sm">
            <ProgramIcon size={14} weight="bold" aria-hidden="true" />
            {getTrainerRoleBadge(trainer)}
          </span>
        </div>

        <div className="absolute right-4 top-16 z-20 flex max-w-[170px] flex-col gap-2 sm:right-5 sm:top-20">
          <TrainerStatPill
            icon={GraduationCap}
            label={getTrainerExperienceLabel(trainer)}
          />
          <TrainerStatPill icon={UsersThree} label={getTrainerStudentsTrained(trainer)} />
          <TrainerStatPill icon={Star} label={getTrainerExpertiseHighlight(trainer)} />
        </div>

        <div className="absolute bottom-0 left-1/2 z-10 h-[220px] w-[220px] -translate-x-1/2 translate-y-8 rounded-full bg-primary sm:h-[250px] sm:w-[250px] sm:translate-y-10" />

        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-6">
          {trainer.image ? (
            <div className="relative h-[250px] w-full max-w-[280px] sm:h-[270px]">
              <Image
                src={trainer.image}
                alt={trainer.name}
                fill
                unoptimized={isLocalImage}
                className="object-contain object-bottom drop-shadow-[0_18px_28px_rgba(15,23,42,0.18)]"
                style={{ objectPosition: trainer.imagePosition ?? "center bottom" }}
                sizes="(max-width: 640px) 90vw, 320px"
                priority={trainer.featured}
              />
            </div>
          ) : (
            <div className="relative z-20 flex h-[250px] w-full max-w-[280px] items-end justify-center pb-4">
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-4xl font-bold text-white shadow-xl">
                {getInitials(trainer.name)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
        <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.7rem]">
          {trainer.name}
        </h3>
        <p className="mt-1 text-sm font-bold uppercase tracking-[0.16em] text-primary">
          {getTrainerHeadline(trainer)}
        </p>

        {showBio && (
          <p className="mt-4 text-sm leading-relaxed text-muted">{trainer.bio}</p>
        )}

        <div className="mt-5 inline-flex w-full flex-wrap items-center gap-2 rounded-full border border-border/70 bg-white px-3 py-2 shadow-sm">
          {showcaseSkills.map((skill) => {
            const style = getSkillIconStyle(skill);
            return (
              <span
                key={skill}
                title={skill}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-[10px] font-bold",
                  style.bg,
                  style.text
                )}
              >
                {style.label}
              </span>
            );
          })}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-5">
          <div className="flex min-w-0 items-center gap-2 text-sm text-muted">
            <User size={16} weight="duotone" className="shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{trainer.designation}</span>
          </div>
          <Link
            href={`/trainers#${trainer.id}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            View Profile
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
