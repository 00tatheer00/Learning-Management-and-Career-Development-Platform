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
  const gradient = category?.headerGradient ?? "from-orange-500 to-amber-500";

  return (
    <section
      className={cn(
        "student-hero-card mb-6 p-6 sm:p-8 bg-gradient-to-br",
        gradient
      )}
    >
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ProgramCategoryBadge programSlug={programSlug} variant="onDark" />
            {canJoinLive ? (
              <span className="student-badge-live rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                Live classes active
              </span>
            ) : (
              <span className="student-badge-pending rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                Module starts soon
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white/85">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">{firstName}</h1>
            <p className="text-sm sm:text-base text-white/90 mt-2 max-w-xl leading-relaxed">
              {programTitle}
              {moduleName ? ` · ${moduleName}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="rounded-xl bg-white/15 backdrop-blur border border-white/20 px-3 py-2 text-center min-w-[4.5rem]">
              <p className="text-[10px] uppercase tracking-wider text-white/75">Lessons</p>
              <p className="text-lg font-bold tabular-nums">{materialsCount}</p>
            </div>
            <div className="rounded-xl bg-white/15 backdrop-blur border border-white/20 px-3 py-2 text-center min-w-[4.5rem]">
              <p className="text-[10px] uppercase tracking-wider text-white/75">Tasks</p>
              <p className="text-lg font-bold tabular-nums">{assignmentsCount}</p>
            </div>
            <div className="rounded-xl bg-white/15 backdrop-blur border border-white/20 px-3 py-2 text-center min-w-[4.5rem]">
              <p className="text-[10px] uppercase tracking-wider text-white/75">Module</p>
              <p className="text-sm font-bold truncate max-w-[7rem]">{moduleName ?? "—"}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2 shrink-0">
          {canJoinLive ? (
            <Button size="lg" asChild className="bg-white text-zinc-900 hover:bg-white/90 shadow-lg">
              <Link href="/student/classes">
                <VideoCamera size={18} weight="duotone" />
                Join Live Class
              </Link>
            </Button>
          ) : (
            <Button size="lg" variant="secondary" asChild className="bg-white/15 text-white border-white/25 hover:bg-white/25">
              <Link href="/student/classes">View Schedule</Link>
            </Button>
          )}
          <Button size="lg" variant="secondary" asChild className="bg-white/10 text-white border-white/25 hover:bg-white/20">
            <Link href="/student/course">
              <BookOpen size={18} weight="duotone" />
              My Course
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild className="bg-white/10 text-white border-white/25 hover:bg-white/20">
            <Link href="/student/recordings">
              <FilmStrip size={18} weight="duotone" />
              Recordings
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild className="bg-white/10 text-white border-white/25 hover:bg-white/20 hidden sm:inline-flex">
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
