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

export default async function StudentClassesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const moduleEnrollments = user.email
    ? await getStudentModuleEnrollmentViews(user.email, programSlug)
    : [];
  const sessions = sortLiveSessionsForDisplay(await getLiveSessionsPreview(programSlug));
  const classSchedule = getStudentClassSchedule(programSlug);
  const canJoinLive = studentHasLiveClassAccess(programSlug, moduleEnrollments, user.email);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Live learning"
        title="Live Classes"
        description={
          canJoinLive
            ? "Join opens 10 minutes before class. Past sessions show as Done — rewatch from Recordings."
            : "Your module batch has not started yet. Module 1 students are in live classes now."
        }
      />

      {!canJoinLive && (
        <ModuleStartsSoonNotice programSlug={programSlug} studentModule={user.level} />
      )}

      <PortalSurfaceCard className="p-4 sm:p-5 border border-pt">
        <p className="font-semibold text-pt">{classSchedule.headline}</p>
        <p className="text-sm text-pt-muted mt-1">
          {classSchedule.daysLabel} · {classSchedule.subline}
        </p>
        <p className="text-sm text-pt-muted mt-3 pt-3 border-t border-pt-subtle">
          <strong className="text-pt">Join Class</strong> opens 10 minutes before the scheduled time
          and closes when class ends.
        </p>
      </PortalSurfaceCard>

      {sessions.length === 0 ? (
        <EmptyState
          title="Class link coming soon"
          description={`${classSchedule.startDateLabel}. ${classSchedule.daysLabel}. ${classSchedule.subline}`}
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <StudentLiveSessionCard
              key={session.id}
              session={session}
              programSlug={programSlug}
              canJoinLive={canJoinLive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
