import Link from "next/link";
import { CalendarBlank } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssignments, getLiveSessionsPreview } from "@/lib/api/portal-data";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { PortalSurfaceCard } from "@/components/portal/portal-ui";
import { StudentTrainerCard } from "@/components/portal/student-trainer-card";
import { StudentNextClassCard } from "@/components/portal/student-next-class-card";
import { StudentModuleRoadmap } from "@/components/portal/student-module-roadmap";
import { StudentClassProgressCard } from "@/components/portal/student-class-progress-card";
import { StudentAttendanceProgressCard } from "@/components/portal/student-attendance";
import { StudentAttendanceMissedAlert } from "@/components/portal/student-attendance-alert";
import { StudentDashboardHero } from "@/components/portal/student-dashboard-hero";
import { StudentEnrolledModulesGrid } from "@/components/portal/student-enrolled-modules-grid";
import { StudentFeatureCards } from "@/components/portal/student-feature-cards";
import { StudentUpcomingLessonsTable } from "@/components/portal/student-upcoming-lessons-table";
import { StudentDashboardRail } from "@/components/portal/student-dashboard-rail";
import { StudentReveal, StudentStagger, StudentStaggerItem } from "@/components/portal/student-motion";
import { findNextUpcomingSession } from "@/lib/utils/session-datetime";
import {
  filterByStudentModule,
} from "@/lib/modules/student-module-content";
import { getStudentModuleContentContext } from "@/lib/modules/student-module-content-server";
import {
  getStudentModuleEnrollmentViews,
  studentHasLiveClassAccess,
} from "@/lib/api/student-module-enrollments";
import {
  fetchMergedByProgram,
  getStudentPortalProgramSlugs,
} from "@/lib/student-portal/program-scope";

import { PAKISTAN_TZ } from "@/lib/utils/pakistan-time";

function formatDashboardDate() {
  return new Date().toLocaleDateString("en-GB", {
    timeZone: PAKISTAN_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlugs = await getStudentPortalProgramSlugs(user);
  const primaryProgramSlug = user.programSlug ?? "web-development";
  const moduleContext = await getStudentModuleContentContext(user);
  const [allAssignments, allSessions, allRecordings] = await Promise.all([
    fetchMergedByProgram(programSlugs, getAssignments),
    fetchMergedByProgram(programSlugs, getLiveSessionsPreview),
    fetchMergedByProgram(programSlugs, getClassRecordings),
  ]);
  const assignments = filterByStudentModule(allAssignments, moduleContext, (item) => item.level, (item) => item.programSlug);
  const sessions = filterByStudentModule(allSessions, moduleContext, (session) => session.level, (session) => session.programSlug);
  const recordings = filterByStudentModule(allRecordings, moduleContext, (item) => item.level, (item) => item.programSlug);
  const enrolledModules = moduleContext.approvedLevels;
  // Aggregate module enrollments across all enrolled programs
  const moduleEnrollments = user.email
    ? (await Promise.all(
        programSlugs.map((slug) => getStudentModuleEnrollmentViews(user.email, slug))
      )).flat()
    : [];
  const nextSession = findNextUpcomingSession(sessions, primaryProgramSlug);
  const canJoinLive = studentHasLiveClassAccess(
    primaryProgramSlug,
    moduleEnrollments,
    user.email,
    allSessions,
    user.level
  );

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
        programSlug={primaryProgramSlug}
        moduleName={user.level}
        canJoinLive={canJoinLive}
      />

      <StudentReveal delay={0.03}>
        <StudentEnrolledModulesGrid
          currentModule={user.level || null}
          approvedModules={enrolledModules}
          programSlug={primaryProgramSlug}
        />
      </StudentReveal>

      {canJoinLive && (
        <StudentReveal delay={0.04}>
          <StudentAttendanceMissedAlert
            programSlug={primaryProgramSlug}
            studentId={user.id}
            studentLevel={user.level}
            studentEmail={user.email}
          />
        </StudentReveal>
      )}

      <StudentReveal delay={0.05}>
        <StudentFeatureCards
          counts={{
            recordings: recordings.length,
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
                programSlug={nextSession.programSlug ?? primaryProgramSlug}
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
                  programSlug={primaryProgramSlug}
                  studentId={user.id}
                  studentLevel={user.level}
                  studentEmail={user.email}
                />
              </StudentStaggerItem>
              <StudentStaggerItem>
                <StudentClassProgressCard
                  programSlug={primaryProgramSlug}
                  studentLevel={user.level}
                />
              </StudentStaggerItem>
            </StudentStagger>
          )}

          <StudentReveal delay={0.14}>
            <StudentModuleRoadmap
              programSlug={primaryProgramSlug}
              currentModule={user.level}
              enrolledModules={enrolledModules}
            />
          </StudentReveal>

          <StudentReveal delay={0.16}>
            <StudentTrainerCard programSlug={primaryProgramSlug} trainerId={user.trainerId} />
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
              programSlug={primaryProgramSlug}
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
