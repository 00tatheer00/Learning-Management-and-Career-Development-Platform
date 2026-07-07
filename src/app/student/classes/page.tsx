import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionsPreview } from "@/lib/api/portal-data";
import { getStudentClassSchedule } from "@/lib/constants/student-portal-ur";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
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
  const canJoinLive = studentHasLiveClassAccess(programSlug, moduleEnrollments);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Student Portal"
        title="Live Classes"
        description={
          canJoinLive
            ? "Join opens 10 minutes before class and closes at class end time. Completed classes show as Done."
            : "Your module batch has not started yet. Module 1 students are in live classes now."
        }
      />

      {!canJoinLive && (
        <div className="mb-6">
          <ModuleStartsSoonNotice programSlug={programSlug} studentModule={user.level} />
        </div>
      )}

      <p className="mb-4 text-sm rounded-xl border border-primary/20 bg-primary/5 p-4">
        <span className="font-semibold text-foreground">{classSchedule.headline}</span>
        <br />
        <span className="text-muted">{classSchedule.daysLabel} · {classSchedule.subline}</span>
      </p>

      <p className="mb-6 text-sm text-muted rounded-xl border border-border bg-surface p-4">
        <strong className="text-foreground">Join Class</strong> opens 10 minutes before the scheduled
        time and closes when class ends. Past classes show as{" "}
        <strong className="text-foreground">Done</strong> — use Class Recordings to rewatch.
      </p>

      {sessions.length === 0 ? (
        <EmptyState
          title="Class link coming soon"
          description={`${classSchedule.startDateLabel}. ${classSchedule.daysLabel}. ${classSchedule.subline}`}
        />
      ) : (
        <div className="space-y-4">
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
