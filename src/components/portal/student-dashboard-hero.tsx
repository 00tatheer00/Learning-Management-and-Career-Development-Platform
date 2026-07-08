import Link from "next/link";
import { BookOpen, VideoCamera, FilmStrip, GraduationCap } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { ProgramCategoryBadge } from "@/components/portal/program-category-badge";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { getProgramBySlug } from "@/lib/data/programs";
import { cn } from "@/lib/utils";

interface StudentDashboardHeroProps {
  name: string;
  programSlug: string;
  moduleName?: string | null;
  canJoinLive: boolean;
  materialsCount: number;
  assignmentsCount: number;
}

export function StudentDashboardHero({
  name,
  programSlug,
  moduleName,
  canJoinLive,
  materialsCount,
  assignmentsCount,
}: StudentDashboardHeroProps) {
  const firstName = name.split(" ")[0] ?? name;
  const category = getProgramCategory(programSlug);
  const programTitle = getProgramBySlug(programSlug)?.title ?? category?.title ?? "Your course";
  const heroVariant = programSlug === "app-development" ? "student-hero-app" : "student-hero-web";

  return (
    <section className={cn("student-hero-card mb-6 p-6 sm:p-8 lg:p-10", heroVariant)}>
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <ProgramCategoryBadge programSlug={programSlug} variant="onDark" />
            {canJoinLive ? (
              <span className="student-badge-live rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Live classes active
              </span>
            ) : (
              <span className="student-badge-pending rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Module starts soon
              </span>
            )}
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-sky-200/70">
              Welcome back
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-white leading-[1.1]">
              {firstName}
            </h1>
            <p className="text-sm sm:text-base text-slate-300/95 mt-3 max-w-xl leading-relaxed">
              {programTitle}
              {moduleName ? ` · ${moduleName}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 pt-0.5">
            {[
              { label: "Lessons", value: materialsCount },
              { label: "Tasks", value: assignmentsCount },
              { label: "Module", value: moduleName ?? "—" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/[0.12] px-4 py-2.5 text-center min-w-[5rem] shadow-sm"
              >
                <p className="text-[9px] uppercase tracking-[0.16em] text-sky-100/60 font-medium">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 font-semibold tabular-nums text-white",
                    typeof stat.value === "string" ? "text-sm truncate max-w-[7rem]" : "text-lg"
                  )}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2.5 shrink-0">
          {canJoinLive ? (
            <Button
              size="lg"
              asChild
              className="bg-[#c9a84c] text-[#0b1b33] hover:bg-[#d4b55e] shadow-lg shadow-black/25 border-0 font-semibold"
            >
              <Link href="/student/classes">
                <VideoCamera size={18} weight="duotone" />
                Join Live Class
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="bg-white/[0.1] text-white border-white/15 hover:bg-white/[0.16]"
            >
              <Link href="/student/classes">View Schedule</Link>
            </Button>
          )}
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="bg-white/[0.08] text-slate-100 border-white/12 hover:bg-white/[0.14]"
          >
            <Link href="/student/course">
              <BookOpen size={18} weight="duotone" />
              My Course
            </Link>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="bg-white/[0.08] text-slate-100 border-white/12 hover:bg-white/[0.14]"
          >
            <Link href="/student/recordings">
              <FilmStrip size={18} weight="duotone" />
              Recordings
            </Link>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="bg-white/[0.08] text-slate-100 border-white/12 hover:bg-white/[0.14] hidden sm:inline-flex"
          >
            <Link href="/student/profile">
              <GraduationCap size={18} weight="duotone" />
              Profile
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
