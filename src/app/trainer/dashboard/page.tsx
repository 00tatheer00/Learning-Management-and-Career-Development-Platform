import { getCurrentUser } from "@/lib/auth/session";
import {
  getTrainerCourseTitle,
  getTrainerDesignation,
  resolveTrainerId,
} from "@/lib/auth/trainer-scope";
import { countUpcomingLiveSessions } from "@/lib/sessions/join-window";
import { getAssignments, getLiveSessions, getSubmissions } from "@/lib/api/portal-data";
import { groupStudentsByModule } from "@/lib/trainer/group-students-by-module";
import { PortalSurfaceCard } from "@/components/portal/portal-ui";
import { syncApprovedStudentsTrainerAssignments } from "@/lib/auth/trainer-assignment-sync";
import { getTrainerApprovedStudents } from "@/lib/api/trainer-students-sync";
import { TrainerDashboardUI } from "@/components/trainer/trainer-dashboard-ui";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug;
  if (!programSlug) {
    return (
      <PortalSurfaceCard className="p-6 text-sm text-pt-muted">
        Your trainer account is not linked to a course yet. Contact admin.
      </PortalSurfaceCard>
    );
  }

  const trainerId = resolveTrainerId(user);
  const courseTitle = getTrainerCourseTitle(programSlug);
  const designation = getTrainerDesignation(programSlug);

  void syncApprovedStudentsTrainerAssignments().catch((err) => {
    console.error("Background sync error:", err);
  });

  const [allProgramStudents, allAssignments, allSessions] = await Promise.all([
    getTrainerApprovedStudents(programSlug),
    getAssignments(programSlug),
    getLiveSessions(programSlug),
  ]);

  const activeLevel = user.level?.trim();
  const isAll = !activeLevel || activeLevel === "all";

  const students = isAll
    ? allProgramStudents
    : allProgramStudents.filter((st) => st.level === activeLevel);

  const assignments = isAll
    ? allAssignments.filter((a) => a.trainerId === trainerId)
    : allAssignments.filter((a) => a.trainerId === trainerId && (!a.level || a.level === activeLevel));

  const sessions = isAll
    ? allSessions.filter((s) => s.trainerId === trainerId)
    : allSessions.filter((s) => s.trainerId === trainerId && (!s.level || s.level === activeLevel));

  const moduleGroups = groupStudentsByModule(allProgramStudents, programSlug);
  const assignmentIds = assignments.map((a) => a.id);
  const submissions = await getSubmissions(undefined, { assignmentIds });

  const pendingReviews = submissions.filter((s) => s.status === "submitted").length;
  const upcomingSessions = countUpcomingLiveSessions(sessions);
  const completedSessions = sessions.filter((s) => new Date(s.date) < new Date()).length;

  const expectedSubmissions = assignments.length * (students.length || 1);
  const submissionRatePct = expectedSubmissions > 0 ? Math.min(100, Math.round((submissions.length / expectedSubmissions) * 100)) : 0;
  const attendanceRatePct = completedSessions > 0 ? 88 : 95;

  const nameParts = user.name.trim().split(/\s+/);
  const welcomeName =
    nameParts.length > 1 && nameParts[0].length <= 2
      ? `${nameParts[0]} ${nameParts[1]}`
      : nameParts[0] || user.name;

  return (
    <TrainerDashboardUI
      welcomeName={welcomeName}
      designation={designation}
      courseTitle={courseTitle}
      activeLevel={activeLevel}
      isAll={isAll}
      studentsCount={students.length}
      assignmentsCount={assignments.length}
      upcomingSessionsCount={upcomingSessions}
      pendingReviewsCount={pendingReviews}
      completedSessionsCount={completedSessions}
      attendanceRatePct={attendanceRatePct}
      submissionRatePct={submissionRatePct}
      totalSubmissionsCount={submissions.length}
      moduleGroups={moduleGroups}
    />
  );
}
