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
import { PortalPageHeader, StatCard, QuickActionCard } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug;
  if (!programSlug) {
    return (
      <p className="text-muted">Your trainer account is not linked to a course yet. Contact admin.</p>
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
  const assignments = allAssignments.filter((a) => a.trainerId === trainerId);
  const sessions = allSessions.filter((s) => s.trainerId === trainerId);
  const assignmentIds = new Set(assignments.map((a) => a.id));
  const submissions = allSubmissions.filter((s) => assignmentIds.has(s.assignmentId));

  const pendingReviews = submissions.filter((s) => s.status === "submitted").length;
  const today = new Date().toISOString().split("T")[0];
  const upcomingSessions = sessions.filter((s) => s.date >= today).length;

  return (
    <div>
      <PortalPageHeader
        title={`Welcome, ${user.name.split(" ")[0]}!`}
        description={`${designation} · ${courseTitle}. Manage your students, classes, and assignments here.`}
      >
        <Button size="lg" asChild>
          <Link href="/trainer/classes">Schedule Class</Link>
        </Button>
      </PortalPageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="My Students" value={students.length} accent="blue" />
        <StatCard label="Assignments" value={assignments.length} accent="orange" />
        <StatCard label="Upcoming Classes" value={upcomingSessions} accent="green" />
        <StatCard label="To Review" value={pendingReviews} accent="slate" hint="Pending submissions" />
      </div>

      <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickActionCard href="/trainer/students" title="View Students" description={`Students in ${courseTitle}`} icon={<Users size={24} weight="duotone" />} color="bg-blue-500/10 text-blue-600" />
        <QuickActionCard href="/trainer/classes" title="Live Classes" description="Schedule and share class links" icon={<VideoCamera size={24} weight="duotone" />} />
        <QuickActionCard href="/trainer/assignments" title="Assignments" description="Create homework and review submissions" icon={<ClipboardText size={24} weight="duotone" />} color="bg-orange-500/10 text-orange-600" />
        <QuickActionCard href="/trainer/materials" title="Course Videos" description="View learning materials for your course" icon={<BookOpen size={24} weight="duotone" />} color="bg-emerald-500/10 text-emerald-600" />
      </div>
    </div>
  );
}
