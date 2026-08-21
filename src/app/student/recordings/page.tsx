import Link from "next/link";
import {
  PlayCircle,
  LinkSimple,
  FileText,
  ArrowSquareOut,
  Clock,
  Sparkle,
  ArrowsLeftRight,
  NotePencil,
} from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getMaterials } from "@/lib/api/portal-data";
import {
  filterLecturesForStudent,
  getLecturesByProgram,
  getWatchProgressMap,
} from "@/lib/api/student-lectures";
import { getProgramBySlug } from "@/lib/data/programs";
import { StudentCourseLectures } from "@/components/portal/student-course-lectures";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { filterByStudentModule } from "@/lib/modules/student-module-content";
import { getStudentModuleContentContext } from "@/lib/modules/student-module-content-server";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import {
  fetchMergedByProgram,
  getStudentPortalProgramSlugs,
} from "@/lib/student-portal/program-scope";

const typeIcons = {
  video: PlayCircle,
  link: LinkSimple,
  document: FileText,
};

export default async function StudentRecordingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlugs = await getStudentPortalProgramSlugs(user);
  const isDemo = isDemoPortalStudent(user.email);
  const moduleContext = await getStudentModuleContentContext(user);
  const [allMaterials, allLectures] = await Promise.all([
    fetchMergedByProgram(programSlugs, getMaterials),
    fetchMergedByProgram(programSlugs, getLecturesByProgram),
  ]);
  const materials = filterByStudentModule(allMaterials, moduleContext, (item) => item.level, (item) => item.programSlug);
  const lectures = filterLecturesForStudent(allLectures, moduleContext);
  const progressMap = await getWatchProgressMap(
    user.id,
    lectures.map((lecture) => lecture.id)
  );

  const totalDurationSeconds = lectures.reduce((acc, l) => acc + (l.duration ?? 0), 0);
  const completedCount = lectures.filter((l) => progressMap[l.id]?.completed).length;
  const inProgressCount = lectures.filter(
    (l) => progressMap[l.id] && progressMap[l.id].watchedSeconds > 0 && !progressMap[l.id].completed
  ).length;

  return (
    <div className="space-y-10 pb-16">
      {/* Apple-style Minimalist Page Header with Micro Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
              On-Demand Cinema &amp; Lectures
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Class Recordings
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {isDemo
              ? "Web Development + App Development — Studio master recordings with DRM encryption, interactive notes, and smart bookmarks."
              : `${getProgramBySlug(programSlugs[0] ?? "web-development")?.title ?? "Course"} — High-definition class recordings, interactive study notes, and master session archives.`}
          </p>
        </div>

        {/* Apple Style Micro Badge Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/50 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
            <span className="font-bold text-foreground">{lectures.length}</span> Classes
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/50 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
            <Clock size={14} className="text-primary" />
            <span className="font-bold text-foreground">
              {totalDurationSeconds > 0 ? `${Math.round(totalDurationSeconds / 60)} mins` : "Ready"}
            </span>
          </div>
          {completedCount > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-500 shadow-sm">
              <span>{completedCount} Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Apple Bento Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-surface/80 to-surface/30 p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-3.5 group-hover:scale-110 transition-transform">
            <Clock size={20} weight="duotone" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Smart Auto-Resume</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Your exact playback position is synced in real time across devices. Pick up exactly where you left off.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-surface/80 to-surface/30 p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-3.5 group-hover:scale-110 transition-transform">
            <NotePencil size={20} weight="duotone" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Timestamped Study Notes</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Press &apos;N&apos; to write timestamped notes while watching. Click any note to jump directly to key concepts.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-surface/80 to-surface/30 p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-3.5 group-hover:scale-110 transition-transform">
            <Sparkle size={20} weight="duotone" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Adaptive HD Stream</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            High bitrate Bunny CDN with DRM stream encryption, variable speed (0.75x–2x), and keyboard shortcuts.
          </p>
        </div>
      </div>

      {lectures.length > 0 && (
        <StudentCourseLectures lectures={lectures} initialProgress={progressMap} />
      )}

      <div>
        <h2 className="text-lg font-bold text-pt mb-4">Lessons &amp; Materials</h2>

        {materials.length === 0 && lectures.length === 0 ? (
          <EmptyState
            title="No recordings for your module yet"
            description="Your instructor or admin will upload high-definition video recordings for your module soon."
            action={
              <Button asChild>
                <Link href="/student/classes">View Live Classes</Link>
              </Button>
            }
          />
        ) : materials.length === 0 ? (
          <p className="text-sm text-pt-muted">
            Extra practice links will appear here when your instructor adds them.
          </p>
        ) : (
          <div className="grid gap-3">
            {materials.map((material, index) => {
              const Icon = typeIcons[material.type];
              return (
                <a
                  key={material.id}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group portal-card rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4 hover:border-primary/30 hover:shadow-pt-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={18} weight="duotone" className="text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-wide text-pt-faint">
                        {material.type === "video"
                          ? "Video Lesson"
                          : material.type === "link"
                            ? "Practice Link"
                            : "Document"}
                      </span>
                    </div>
                    <p className="font-semibold text-lg text-pt group-hover:text-primary transition-colors">
                      {material.title}
                    </p>
                    <p className="text-sm text-pt-muted mt-0.5">{material.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-primary font-semibold text-sm shrink-0 sm:ml-auto">
                    Open
                    <ArrowSquareOut size={14} />
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
