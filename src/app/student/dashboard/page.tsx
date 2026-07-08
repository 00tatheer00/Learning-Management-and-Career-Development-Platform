import Link from "next/link";
import { CalendarBlank } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssignments, getLiveSessionsPreview, getMaterials } from "@/lib/api/portal-data";
import { PortalSurfaceCard } from "@/components/portal/portal-ui";
import { StudentTrainerCard } from "@/components/portal/student-trainer-card";
import { StudentWhatsAppGroupCard } from "@/components/portal/student-whatsapp-group-card";
import { StudentNextClassCard } from "@/components/portal/student-next-class-card";
import { StudentModuleRoadmap } from "@/components/portal/student-module-roadmap";
import { StudentClassProgressCard } from "@/components/portal/student-class-progress-card";
import { StudentAttendanceProgressCard } from "@/components/portal/student-attendance";
import { StudentDashboardHero } from "@/components/portal/student-dashboard-hero";
import { StudentFeatureCards } from "@/components/portal/student-feature-cards";
import { StudentUpcomingLessonsTable } from "@/components/portal/student-upcoming-lessons-table";
import { StudentDashboardRail } from "@/components/portal/student-dashboard-rail";
import { StudentReveal, StudentStagger, StudentStaggerItem } from "@/components/portal/student-motion";
import { findNextUpcomingSession } from "@/lib/utils/session-datetime";
import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";
import {
  getStudentModuleEnrollmentViews,
  studentHasLiveClassAccess,
} from "@/lib/api/student-module-enrollments";

function formatDashboardDate() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

  const classDates = sessions.map((s) => s.date);
  const reminders: {
    id: string;
    label: string;
    sub?: string;
    href: string;
    icon: "bell" | "calendar" | "chat";
  }[] = [];

  if (nextSession) {
    reminders.push({
      id: "next-class",
      label: nextSession.title,
      sub: `${nextSession.date} · ${nextSession.time}`,
      href: "/student/classes",
      icon: "calendar",
    });
  }
  if (assignments.length > 0) {
    reminders.push({
      id: "assignments",
      label: `${assignments.length} assignment${assignments.length === 1 ? "" : "s"} available`,
      sub: "Check homework and due tasks",
      href: "/student/assignments",
      icon: "bell",
    });
  }
  reminders.push({
    id: "whatsapp",
    label: "Join class WhatsApp group",
    sub: "Stay updated with your batch",
    href: "/student/classes",
    icon: "chat",
  });

  const lessonRows = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    date: s.date,
    time: s.time,
    trainerName: s.trainerName,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-pt-faint">Dashboard</p>
        <p className="student-dashboard-date flex items-center gap-2 text-sm text-pt-muted">
          <CalendarBlank size={16} weight="duotone" className="text-primary/80" />
          {formatDashboardDate()}
        </p>
      </div>

      <StudentDashboardHero
        name={user.name}
        programSlug={programSlug}
        moduleName={user.level}
        canJoinLive={canJoinLive}
      />

      <StudentReveal delay={0.05}>
        <StudentFeatureCards
          counts={{
            lessons: materials.length,
            classes: sessions.length,
            tasks: assignments.length,
          }}
        />
      </StudentReveal>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-6">
          <StudentReveal delay={0.08}>
            {nextSession ? (
              <StudentNextClassCard
                session={nextSession}
                canJoinLive={canJoinLive}
                programSlug={programSlug}
                studentModule={user.level}
              />
            ) : (
              <PortalSurfaceCard className="student-glass-card p-5 border-dashed border-pt-subtle">
                <p className="font-semibold text-pt">No upcoming class scheduled yet</p>
                <p className="text-sm text-pt-muted mt-1">
                  Your trainer will add the next session. Check{" "}
                  <Link href="/student/classes" className="text-primary font-medium hover:underline">
                    Live Classes
                  </Link>{" "}
                  for updates.
                </p>
              </PortalSurfaceCard>
            )}
          </StudentReveal>

          <StudentReveal delay={0.1}>
            <StudentUpcomingLessonsTable sessions={lessonRows} canJoinLive={canJoinLive} />
          </StudentReveal>

          {canJoinLive && (
            <StudentStagger className="grid gap-4 sm:grid-cols-2" delay={0.12} stagger={0.08}>
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

          <StudentReveal delay={0.14}>
            <StudentModuleRoadmap
              programSlug={programSlug}
              currentModule={user.level}
              enrolledModules={enrolledModules}
            />
          </StudentReveal>

          <StudentReveal delay={0.16}>
            <div className="grid gap-4 sm:grid-cols-2">
              <StudentTrainerCard programSlug={programSlug} trainerId={user.trainerId} />
              <StudentWhatsAppGroupCard variant="banner" />
            </div>
          </StudentReveal>

          {moduleEnrollments.length > 1 && (
            <StudentReveal delay={0.18}>
              <PortalSurfaceCard href="/student/profile" className="student-glass-card p-4">
                <p className="text-sm font-semibold text-pt">Multiple module logins</p>
                <p className="text-xs text-pt-muted mt-1">
                  You have {moduleEnrollments.length} approved modules. View passwords on your profile.
                </p>
              </PortalSurfaceCard>
            </StudentReveal>
          )}
        </div>

        <div className="xl:col-span-4">
          <StudentReveal delay={0.1}>
            <StudentDashboardRail
              name={user.name}
              avatarUrl={user.avatarUrl}
              avatarInitials={user.avatarInitials}
              programSlug={programSlug}
              moduleName={user.level}
              classDates={classDates}
              reminders={reminders}
            />
          </StudentReveal>
        </div>
      </div>
    </div>
  );
}
