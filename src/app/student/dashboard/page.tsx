import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssignments, getLiveSessionsPreview, getMaterials } from "@/lib/api/portal-data";
import { PortalSurfaceCard, StatCard } from "@/components/portal/portal-ui";
import { StudentTrainerCard } from "@/components/portal/student-trainer-card";
import { StudentWhatsAppGroupCard } from "@/components/portal/student-whatsapp-group-card";
import { StudentNextClassCard } from "@/components/portal/student-next-class-card";
import { StudentModuleRoadmap } from "@/components/portal/student-module-roadmap";
import { StudentClassProgressCard } from "@/components/portal/student-class-progress-card";
import { StudentAttendanceProgressCard } from "@/components/portal/student-attendance";
import { StudentDashboardHero } from "@/components/portal/student-dashboard-hero";
import { StudentReveal, StudentStagger, StudentStaggerItem } from "@/components/portal/student-motion";
import { findNextUpcomingSession } from "@/lib/utils/session-datetime";
import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";
import {
  getStudentModuleEnrollmentViews,
  studentHasLiveClassAccess,
} from "@/lib/api/student-module-enrollments";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const [materials, assignments, sessions] = await Promise.all([
    getMaterials(programSlug),
    getAssignments(programSlug),
    getLiveSessionsPreview(programSlug),
  ]);
  const enrolledModules = user.email
    ? await getApprovedEnrollmentLevels(user.email, programSlug)
    : [];
  const moduleEnrollments = user.email
    ? await getStudentModuleEnrollmentViews(user.email, programSlug)
    : [];
  const nextSession = findNextUpcomingSession(sessions, programSlug);
  const canJoinLive = studentHasLiveClassAccess(programSlug, moduleEnrollments);

  return (
    <div className="space-y-8">
      <StudentDashboardHero
        name={user.name}
        programSlug={programSlug}
        moduleName={user.level}
        canJoinLive={canJoinLive}
      />

      <StudentReveal delay={0.08}>
        {nextSession ? (
          <StudentNextClassCard
            session={nextSession}
            canJoinLive={canJoinLive}
            programSlug={programSlug}
            studentModule={user.level}
          />
        ) : (
          <PortalSurfaceCard className="p-5 border-dashed border-pt-subtle">
            <p className="font-semibold text-pt">No upcoming class scheduled yet</p>
            <p className="text-sm text-pt-muted mt-1">
              Your trainer will add the next session. Check{" "}
              <Link href="/student/classes" className="text-[#c9a84c] font-medium hover:underline">
                Live Classes
              </Link>{" "}
              for updates.
            </p>
          </PortalSurfaceCard>
        )}
      </StudentReveal>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard compact label="Lessons" value={materials.length} accent="orange" href="/student/course" />
        <StatCard compact label="Tasks" value={assignments.length} accent="blue" href="/student/assignments" />
        <StatCard compact label="Classes" value={sessions.length} accent="green" href="/student/classes" />
        <StatCard compact label="Modules" value={enrolledModules.length || user.level || "—"} accent="slate" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          {canJoinLive && (
            <StudentStagger className="grid gap-5 sm:grid-cols-2" delay={0.1} stagger={0.08}>
              <StudentStaggerItem>
                <StudentAttendanceProgressCard
                  programSlug={programSlug}
                  studentId={user.id}
                  studentLevel={user.level}
                />
              </StudentStaggerItem>
              <StudentStaggerItem>
                <StudentClassProgressCard programSlug={programSlug} />
              </StudentStaggerItem>
            </StudentStagger>
          )}

          <StudentReveal delay={0.15}>
            <StudentModuleRoadmap
              programSlug={programSlug}
              currentModule={user.level}
              enrolledModules={enrolledModules}
            />
          </StudentReveal>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <StudentReveal delay={0.12}>
            <StudentTrainerCard programSlug={programSlug} trainerId={user.trainerId} />
          </StudentReveal>
          <StudentReveal delay={0.16}>
            <StudentWhatsAppGroupCard variant="banner" />
          </StudentReveal>
          {moduleEnrollments.length > 1 && (
            <StudentReveal delay={0.2}>
              <PortalSurfaceCard href="/student/profile" className="p-4">
                <p className="text-sm font-semibold text-pt">Multiple module logins</p>
                <p className="text-xs text-pt-muted mt-1">
                  You have {moduleEnrollments.length} approved modules. View passwords on your profile.
                </p>
              </PortalSurfaceCard>
            </StudentReveal>
          )}
        </div>
      </div>
    </div>
  );
}
