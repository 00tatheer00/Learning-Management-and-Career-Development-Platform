import Link from "next/link";
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
  Stack,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { getProgramAccent } from "@/lib/constants/program-accents";
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

interface ProgramCardProps {
  program: Program;
  className?: string;
}

export function ProgramCard({ program, className }: ProgramCardProps) {
  const accent = getProgramAccent(program.slug);
  const Icon = PROGRAM_ICONS[program.slug] ?? Code;
  const isActive = program.category === "active";

  return (
    <Link
      href={`/programs/${program.slug}`}
      className={cn(
        "group relative block h-full transition-all duration-500 hover:-translate-y-2",
        accent.glow,
        className
      )}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-[0_12px_40px_-18px_rgba(15,23,42,0.35)] transition-all duration-500 group-hover:border-primary/25 group-hover:shadow-[0_28px_60px_-24px_rgba(234,88,12,0.28)]">
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-br px-6 pb-8 pt-6",
            accent.gradient
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.2),transparent_45%)]" />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <span
              className={cn(
                "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm"
              )}
            >
              <Icon size={24} weight="duotone" aria-hidden="true" />
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                isActive
                  ? "bg-white text-slate-900"
                  : "border border-white/25 bg-white/10 text-white backdrop-blur-sm"
              )}
            >
              {isActive ? "Enrolling Now" : "Coming Soon"}
            </span>
          </div>

          <div className="relative z-10 mt-8">
            <h3 className="text-2xl font-bold tracking-tight text-white">{program.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/75">
              {program.description}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/80 px-3 py-1 text-xs font-medium text-muted">
              <CalendarDots size={14} weight="duotone" className="text-primary" aria-hidden="true" />
              {program.duration}
            </span>
            {program.modules.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/80 px-3 py-1 text-xs font-medium text-muted">
                <Stack size={14} weight="duotone" className="text-primary" aria-hidden="true" />
                {program.modules.length} modules
              </span>
            )}
          </div>

          {program.modules.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                Modules
              </p>
              <div className="flex flex-wrap gap-1.5">
                {program.modules.map((mod, index) => (
                  <span
                    key={mod.name}
                    className="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground"
                  >
                    {index + 1}. {mod.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {program.outcomes.slice(0, 2).map((outcome) => (
              <li key={outcome} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="line-clamp-2">{outcome}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4 text-sm font-semibold text-primary">
            <span>{isActive ? "View Program" : "Explore Program"}</span>
            <ArrowRight
              size={18}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
