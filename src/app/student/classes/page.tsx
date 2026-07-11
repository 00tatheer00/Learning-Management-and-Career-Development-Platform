import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionsPreview } from "@/lib/api/portal-data";
import { getStudentClassSchedule } from "@/lib/constants/student-portal-ur";
import { PortalPageHeader, EmptyState, PortalSurfaceCard } from "@/components/portal/portal-ui";
import { StudentLiveSessionCard } from "@/components/portal/student-live-session-card";
import { ModuleStartsSoonNotice } from "@/components/portal/module-starts-soon-notice";
import { sortLiveSessionsForDisplay } from "@/lib/sessions/join-window";
import {
  getStudentModuleEnrollmentViews,
  studentHasLiveClassAccess,
} from "@/lib/api/student-module-enrollments";
import {
  filterByStudentModule,
} from "@/lib/modules/student-module-content";
import { getStudentModuleContentContext } from "@/lib/modules/student-module-content-server";
import { StudentMarkSectionSeen } from "@/components/portal/student-mark-section-seen";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import {
  DEMO_STUDENT_PROGRAM_SLUGS,
  fetchMergedByProgram,
  getStudentPortalProgramSlugs,
} from "@/lib/student-portal/program-scope";

export default async function StudentClassesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlugs = getStudentPortalProgramSlugs(user);
  const primaryProgramSlug = user.programSlug ?? "web-development";
  const moduleContext = await getStudentModuleContentContext(user);
  const moduleEnrollments = user.email
    ? await getStudentModuleEnrollmentViews(user.email, primaryProgramSlug)
    : [];
  const allSessions = await fetchMergedByProgram(programSlugs, getLiveSessionsPreview);
  const sessions = sortLiveSessionsForDisplay(
    filterByStudentModule(allSessions, moduleContext, (session) => session.level)
  );
  const scheduleSlugs = isDemoPortalStudent(user.email)
    ? [...DEMO_STUDENT_PROGRAM_SLUGS]
    : [primaryProgramSlug];
  const canJoinLive = studentHasLiveClassAccess(
    primaryProgramSlug,
    moduleEnrollments,
    user.email,
    allSessions,
    user.level
  );

  return (
    <div className="space-y-6">
      <StudentMarkSectionSeen section="classes" />
      <PortalPageHeader
        eyebrow="Live learning"
        title="Live Classes"
        description={
          canJoinLive
            ? "Join opens 10 minutes before class. Past sessions show as Done — rewatch from Recordings."
            : "Live classes for your module will appear here when your batch starts."
        }
      />

      {!canJoinLive && (
        <ModuleStartsSoonNotice programSlug={primaryProgramSlug} studentModule={user.level} />
      )}

      {scheduleSlugs.map((slug) => {
        const classSchedule = getStudentClassSchedule(slug);
        return (
          <PortalSurfaceCard key={slug} className="p-4 sm:p-5 border border-pt">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
              {classSchedule.programLabel}
            </p>
            <p className="font-semibold text-pt">{classSchedule.headline}</p>
            <p className="text-sm text-pt-muted mt-1">
              {classSchedule.daysLabel} · {classSchedule.subline}
            </p>
            <p className="text-sm text-pt-muted mt-3 pt-3 border-t border-pt-subtle">
              <strong className="text-pt">Join Class</strong> opens 10 minutes before the scheduled
              time and closes when class ends.
            </p>
          </PortalSurfaceCard>
        );
      })}

      {sessions.length === 0 ? (
        <EmptyState
          title="Class link coming soon"
          description="Your trainer will add the next session. Check back before class time."
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <StudentLiveSessionCard
              key={session.id}
              session={session}
              programSlug={session.programSlug}
              canJoinLive={canJoinLive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
