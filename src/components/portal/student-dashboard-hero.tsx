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
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <ProgramCategoryBadge programSlug={programSlug} variant="onDark" />
            {canJoinLive ? (
              <span className="student-badge-live rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                Live classes active
              </span>
            ) : (
              <span className="student-badge-pending rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                Module starts soon
              </span>
            )}
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400">
              Welcome back
            </p>
            <h1 className="mt-1.5 text-3xl sm:text-4xl font-semibold tracking-tight text-stone-50">
              {firstName}
            </h1>
            <p className="text-sm sm:text-base text-stone-300/90 mt-2.5 max-w-xl leading-relaxed">
              {programTitle}
              {moduleName ? ` · ${moduleName}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {[
              { label: "Lessons", value: materialsCount },
              { label: "Tasks", value: assignmentsCount },
              { label: "Module", value: moduleName ?? "—" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] px-3.5 py-2.5 text-center min-w-[4.75rem]"
              >
                <p className="text-[9px] uppercase tracking-[0.16em] text-stone-400 font-medium">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 font-semibold tabular-nums text-stone-50",
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
              className="bg-stone-50 text-stone-900 hover:bg-white shadow-lg shadow-black/20 border-0"
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
              className="bg-white/[0.08] text-stone-100 border-white/10 hover:bg-white/[0.14]"
            >
              <Link href="/student/classes">View Schedule</Link>
            </Button>
          )}
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="bg-white/[0.06] text-stone-200 border-white/10 hover:bg-white/[0.12]"
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
            className="bg-white/[0.06] text-stone-200 border-white/10 hover:bg-white/[0.12]"
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
            className="bg-white/[0.06] text-stone-200 border-white/10 hover:bg-white/[0.12] hidden sm:inline-flex"
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
