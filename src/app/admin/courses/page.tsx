import { getMaterials, getAssignments, getLiveSessions } from "@/lib/api/portal-data";
import { programs } from "@/lib/data/programs";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { CourseSyllabusBrowser } from "@/components/portal/course-modules-syllabus";
import { BookOpen, ClipboardText, VideoCamera } from "@phosphor-icons/react/ssr";

export default async function AdminCoursesPage() {
  const [materials, assignments, sessions] = await Promise.all([
    getMaterials(),
    getAssignments(),
    getLiveSessions(),
  ]);

  return (
    <div>
      <PortalPageHeader title="Courses & Content" description="Overview of all course materials, assignments, and scheduled classes." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-background p-5 text-center">
          <BookOpen size={32} weight="duotone" className="text-primary mx-auto mb-2" />
          <p className="text-3xl font-bold">{materials.length}</p>
          <p className="text-sm text-muted">Video Lessons</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5 text-center">
          <ClipboardText size={32} weight="duotone" className="text-blue-600 mx-auto mb-2" />
          <p className="text-3xl font-bold">{assignments.length}</p>
          <p className="text-sm text-muted">Assignments</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5 text-center">
          <VideoCamera size={32} weight="duotone" className="text-emerald-600 mx-auto mb-2" />
          <p className="text-3xl font-bold">{sessions.length}</p>
          <p className="text-sm text-muted">Live Classes</p>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-2">Course Syllabus</h2>
      <p className="text-sm text-muted mb-4">
        Click a course, then a module, to view all topics students will study.
      </p>
      <div className="mb-10">
        <CourseSyllabusBrowser programs={programs} />
      </div>

      <h2 className="text-lg font-bold mb-4">All Programs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((p) => (
          <div key={p.id} className="rounded-xl border border-border p-4">
            <p className="font-semibold">{p.title}</p>
            <p className="text-xs text-muted mt-1 capitalize">{p.category === "active" ? "Open" : "Coming Soon"}</p>
            <p className="text-sm text-muted mt-2 line-clamp-2">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
