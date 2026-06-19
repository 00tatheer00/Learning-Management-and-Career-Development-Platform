import Image from "next/image";
import { Briefcase, Clock } from "@phosphor-icons/react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/shared/social-icons";
import { cn } from "@/lib/utils";
import type { Trainer } from "@/types";

interface TrainerCardProps {
  trainer: Trainer;
  variant?: "compact" | "detailed";
  skillLimit?: number;
  className?: string;
}

function TrainerPhoto({
  trainer,
  size = "md",
  className,
}: {
  trainer: Trainer;
  size?: "md" | "lg";
  className?: string;
}) {
  const dimensions = size === "lg" ? "w-40 h-40 sm:w-44 sm:h-44" : "w-32 h-32 sm:w-36 sm:h-36";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-2xl bg-surface shadow-lg ring-1 ring-black/5",
        dimensions,
        className
      )}
    >
      <Image
        src={trainer.image}
        alt={trainer.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: trainer.imagePosition ?? "center" }}
        sizes={size === "lg" ? "176px" : "144px"}
      />
    </div>
  );
}

function TrainerSkills({ skills }: { skills: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center rounded-full border border-border/80 bg-surface/80 px-2.5 py-1 text-xs font-medium text-muted"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function TrainerSocial({ trainer }: { trainer: Trainer }) {
  const links = [
    { href: trainer.social.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: trainer.social.github, label: "GitHub", Icon: GithubIcon },
    { href: trainer.social.twitter, label: "Twitter", Icon: TwitterIcon },
  ].filter((link) => link.href);

  if (links.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          aria-label={`${trainer.name} on ${label}`}
        >
          <Icon className="h-4 w-4" />
        </a>
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

  if (variant === "detailed") {
    return (
      <article
        className={cn(
          "group overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative flex items-center justify-center bg-gradient-to-br from-primary/8 via-surface to-background px-6 py-8 sm:w-56 sm:shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_55%)]" />
            <TrainerPhoto trainer={trainer} size="lg" className="relative z-10" />
          </div>

          <div className="flex flex-1 flex-col p-6 sm:p-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{trainer.name}</h2>
              <p className="mt-1 text-sm font-semibold text-primary">{trainer.designation}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                <Clock size={14} weight="duotone" className="text-primary" aria-hidden="true" />
                {trainer.experience} experience
              </p>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-muted">{trainer.bio}</p>
            <TrainerSkills skills={trainer.expertise} />
            <div className="mt-6 border-t border-border/70 pt-5">
              <TrainerSocial trainer={trainer} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/8",
        className
      )}
    >
      <div className="relative flex flex-col items-center bg-gradient-to-b from-primary/8 via-surface/60 to-background px-6 pb-5 pt-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.14),transparent_60%)]" />
        <TrainerPhoto trainer={trainer} className="relative z-10" />
        <span className="relative z-10 mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-background/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
          <Briefcase size={14} weight="duotone" aria-hidden="true" />
          {trainer.experience}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <h3 className="text-center text-lg font-bold tracking-tight">{trainer.name}</h3>
        <p className="mt-1 text-center text-sm font-semibold text-primary">{trainer.designation}</p>

        <div className="mt-5 flex flex-1 flex-col gap-4">
          <TrainerSkills skills={skills} />
          <div className="mt-auto flex justify-center border-t border-border/70 pt-4">
            <TrainerSocial trainer={trainer} />
          </div>
        </div>
      </div>
    </article>
  );
}
