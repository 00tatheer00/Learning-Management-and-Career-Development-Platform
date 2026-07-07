import { CalendarBlank } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionsPreview } from "@/lib/api/portal-data";
import { getStudentClassSchedule } from "@/lib/constants/student-portal-ur";
import { canAccessModuleOneClasses } from "@/lib/modules/student-module-access";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { JoinClassButton } from "@/components/portal/join-class-button";
import { ModuleStartsSoonNotice } from "@/components/portal/module-starts-soon-notice";
import { getTodayYmdInPakistan } from "@/lib/utils/pakistan-time";

export default async function StudentClassesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const sessions = await getLiveSessionsPreview(programSlug);
  const classSchedule = getStudentClassSchedule(programSlug);
  const today = getTodayYmdInPakistan();
  const canJoinLive = canAccessModuleOneClasses(programSlug, user.level);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Student Portal"
        title="Live Classes"
        description={
          canJoinLive
            ? "Tap Join Class to open Google Meet directly when your trainer has added the link."
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
        Tap <strong className="text-foreground">Join Class</strong> to enter your trainer&apos;s Google
        Meet. Only enrolled students can join — do not share your portal login with anyone.
      </p>

      {sessions.length === 0 ? (
        <EmptyState
          title="Class link coming soon"
          description={`${classSchedule.startDateLabel}. ${classSchedule.daysLabel}. ${classSchedule.subline}`}
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isUpcoming = session.date >= today;
            return (
              <div
                key={session.id}
                className={`rounded-2xl border-2 p-5 sm:p-6 ${
                  isUpcoming ? "border-primary/30 bg-primary/5" : "border-border bg-background opacity-75"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted mb-2">
                      <CalendarBlank size={18} weight="duotone" />
                      {session.date} · {session.time}
                    </div>
                    <h2 className="text-xl font-bold">{session.title}</h2>
                    <p className="text-muted mt-1">Trainer: {session.trainerName}</p>
                    {session.notes && (
                      <p className="text-sm text-muted mt-2 bg-background rounded-lg p-3 border border-border">
                        {session.notes}
                      </p>
                    )}
                  </div>
                  {canJoinLive ? (
                    session.hasJoinLink ? (
                      <JoinClassButton sessionId={session.id} />
                    ) : (
                      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shrink-0">
                        <p className="font-semibold">Link coming soon</p>
                        <p className="mt-1 text-xs">Your trainer will add the Google Meet link before class.</p>
                      </div>
                    )
                  ) : (
                    <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 shrink-0 max-w-xs">
                      <p className="font-semibold">Your module starts next month</p>
                      <p className="mt-1 text-xs">This class is for Module 1 students only.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
