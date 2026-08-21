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

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="On demand"
        title="Class Recordings"
        description={
          isDemo
            ? "Web Development + App Development — full demo access to class recordings, syllabus, and study notes"
            : `${getProgramBySlug(programSlugs[0] ?? "web-development")?.title ?? "Your course"} — high definition class recordings, syllabus, and study materials`
        }
      />

      {/* Student How-to-use / Quick Tips */}
      <div className="rounded-3xl border border-pt-subtle bg-gradient-to-r from-primary/10 via-surface/80 to-background p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkle size={20} weight="fill" className="text-primary" />
          <h3 className="font-bold text-base text-pt">How to make the most of your Class Recordings</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3">
          <div className="rounded-2xl border border-pt-subtle bg-surface/60 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
              <Clock size={16} weight="duotone" />
              Auto-Resume Watching
            </div>
            <p className="text-xs text-pt-muted leading-relaxed">
              Video player auto-saves your exact watch progress. You can stop anytime and resume right where you left off.
            </p>
          </div>

          <div className="rounded-2xl border border-pt-subtle bg-surface/60 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
              <NotePencil size={16} weight="duotone" />
              Interactive Study Notes
            </div>
            <p className="text-xs text-pt-muted leading-relaxed">
              Write study notes while watching. Timestamped notes are saved to your profile for easy exam and project revision.
            </p>
          </div>

          <div className="rounded-2xl border border-pt-subtle bg-surface/60 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
              <ArrowsLeftRight size={16} weight="duotone" />
              Module Switching
            </div>
            <p className="text-xs text-pt-muted leading-relaxed">
              Use the topbar module switcher to view your current or previous module class recordings anytime.
            </p>
          </div>
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
