import Link from "next/link";
import { Users, VideoCamera, ClipboardText, BookOpen } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import {
  filterStudentsByProgram,
  getTrainerCourseTitle,
  getTrainerDesignation,
} from "@/lib/auth/trainer-scope";
import { getAssignments, getLiveSessions, getSubmissions } from "@/lib/api/portal-data";
import { getUsersByRole } from "@/lib/auth/users";
import { groupStudentsByModule } from "@/lib/trainer/group-students-by-module";
import {
  PortalPageHeader,
  PortalSectionTitle,
  PortalSurfaceCard,
  StatCard,
  QuickActionCard,
  portalPressable,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug;
  if (!programSlug) {
    return (
      <PortalSurfaceCard className="p-6 text-sm text-zinc-500">
        Your trainer account is not linked to a course yet. Contact admin.
      </PortalSurfaceCard>
    );
  }

  const trainerId = user.trainerId ?? user.id;
  const courseTitle = getTrainerCourseTitle(programSlug);
  const designation = getTrainerDesignation(programSlug);

  const [allStudents, allAssignments, allSessions, allSubmissions] = await Promise.all([
    getUsersByRole("student"),
    getAssignments(programSlug),
    getLiveSessions(programSlug),
    getSubmissions(),
  ]);

  const students = filterStudentsByProgram(allStudents, programSlug);
  const moduleGroups = groupStudentsByModule(students, programSlug);
  const assignments = allAssignments.filter((a) => a.trainerId === trainerId);
  const sessions = allSessions.filter((s) => s.trainerId === trainerId);
  const assignmentIds = new Set(assignments.map((a) => a.id));
  const submissions = allSubmissions.filter((s) => assignmentIds.has(s.assignmentId));

  const pendingReviews = submissions.filter((s) => s.status === "submitted").length;
  const today = new Date().toISOString().split("T")[0];
  const upcomingSessions = sessions.filter((s) => s.date >= today).length;

  return (
    <div className="space-y-4">
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title={`Welcome, ${user.name.split(" ")[0]}!`}
        description={`${designation} · ${courseTitle}`}
      >
        <Button size="sm" asChild className="h-8 text-xs">
          <Link href="/trainer/classes">Schedule Class</Link>
        </Button>
      </PortalPageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard compact label="My Students" value={students.length} accent="blue" icon={<Users size={16} weight="duotone" />} href="/trainer/students" />
        <StatCard compact label="Assignments" value={assignments.length} accent="orange" icon={<ClipboardText size={16} weight="duotone" />} href="/trainer/assignments" />
        <StatCard compact label="Upcoming Classes" value={upcomingSessions} accent="green" icon={<VideoCamera size={16} weight="duotone" />} href="/trainer/classes" />
        <StatCard compact label="To Review" value={pendingReviews} accent="slate" hint="Pending submissions" icon={<ClipboardText size={16} weight="duotone" />} href="/trainer/assignments" />
      </div>

      {moduleGroups.length > 0 && (
        <div>
          <PortalSectionTitle
            title="Students by Module"
            action={
              <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                <Link href="/trainer/students">View all</Link>
              </Button>
            }
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {moduleGroups.map((group) => (
              <Link
                key={group.moduleName}
                href={`/trainer/students?module=${encodeURIComponent(group.moduleName)}`}
                className={cn(
                  portalPressable,
                  "rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm hover:border-orange-200/60 hover:shadow-md block"
                )}
              >
                <p className="text-[10px] font-semibold text-zinc-500 truncate">{group.moduleName}</p>
                <p className="text-xl font-bold tabular-nums text-zinc-900 mt-0.5">{group.students.length}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <PortalSectionTitle title="Quick Access" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QuickActionCard compact href="/trainer/students" title="View Students" description={`Students in ${courseTitle}`} icon={<Users size={18} weight="duotone" />} gradient="from-blue-500 to-indigo-500" />
          <QuickActionCard compact href="/trainer/classes" title="Live Classes" description="Schedule & share links" icon={<VideoCamera size={18} weight="duotone" />} gradient="from-orange-500 to-amber-500" />
          <QuickActionCard compact href="/trainer/assignments" title="Assignments" description="Create & review work" icon={<ClipboardText size={18} weight="duotone" />} gradient="from-violet-500 to-purple-600" />
          <QuickActionCard compact href="/trainer/materials" title="Course Videos" description="Learning materials" icon={<BookOpen size={18} weight="duotone" />} gradient="from-emerald-500 to-teal-600" />
        </div>
      </div>
    </div>
  );
}
