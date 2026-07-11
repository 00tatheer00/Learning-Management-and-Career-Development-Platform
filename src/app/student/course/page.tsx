import Link from "next/link";
import { PlayCircle, LinkSimple, FileText, ArrowSquareOut } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getMaterials } from "@/lib/api/portal-data";
import { getProgramBySlug } from "@/lib/data/programs";
import { CourseModulesSyllabus } from "@/components/portal/course-modules-syllabus";
import { PortalPageHeader, EmptyState, PortalSurfaceCard } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import {
  filterByStudentModule,
  getStudentModuleContentContext,
} from "@/lib/modules/student-module-content";
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

export default async function StudentCoursePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlugs = getStudentPortalProgramSlugs(user);
  const isDemo = isDemoPortalStudent(user.email);
  const moduleContext = await getStudentModuleContentContext(user);
  const allMaterials = await fetchMergedByProgram(programSlugs, getMaterials);
  const materials = filterByStudentModule(allMaterials, moduleContext, (item) => item.level);

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="Learning"
        title="My Course"
        description={
          isDemo
            ? "Web Development + App Development — full demo access to syllabus and materials"
            : `${getProgramBySlug(programSlugs[0] ?? "web-development")?.title ?? "Your course"} — syllabus, lessons, and practice materials`
        }
      />

      {programSlugs.map((programSlug) => {
        const program = getProgramBySlug(programSlug);
        if (!program || program.modules.length === 0) return null;

        return (
          <PortalSurfaceCard key={programSlug} className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-pt mb-1">{program.title} — Syllabus</h2>
            <p className="text-sm text-pt-muted mb-5">
              {isDemo ? "Demo access to all modules" : `You are on: ${user.level ?? "—"}`}
              {" · "}
              Tap a module to explore topics
            </p>
            <CourseModulesSyllabus
              program={program}
              activeModuleName={isDemo ? undefined : user.level ?? undefined}
              copyVariant="student"
              restrictToActiveModule={!isDemo}
            />
          </PortalSurfaceCard>
        );
      })}

      <div>
        <h2 className="text-lg font-bold text-pt mb-4">Lessons &amp; Materials</h2>

        {materials.length === 0 ? (
          <EmptyState
            title="No lessons for your module yet"
            description="Your trainer will add videos for your module soon. Check WhatsApp for updates."
            action={
              <Button asChild>
                <Link href="/student/whatsapp">Open WhatsApp Group</Link>
              </Button>
            }
          />
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
