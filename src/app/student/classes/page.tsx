import { CalendarBlank } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionsPreview } from "@/lib/api/portal-data";
import { getProgramClassSchedule } from "@/lib/constants/course-schedule";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { JoinClassButton } from "@/components/portal/join-class-button";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

export default async function StudentClassesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const sessions = await getLiveSessionsPreview(programSlug);
  const classSchedule = getProgramClassSchedule(programSlug);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <PortalPageHeader
        title={STUDENT_UR.classes.title}
        description={STUDENT_UR.classes.description}
      />

      <p className="mb-4 text-sm rounded-xl border border-primary/20 bg-primary/5 p-4">
        <span className="font-semibold text-foreground">{classSchedule.headline}</span>
        <br />
        <span className="text-muted">{classSchedule.daysLabel} · {classSchedule.subline}</span>
      </p>

      <p className="mb-6 text-sm text-muted rounded-xl border border-border bg-surface p-4">
        {STUDENT_UR.classes.joinHint}
      </p>

      {sessions.length === 0 ? (
        <EmptyState
          title={STUDENT_UR.classes.emptyTitle}
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
                    <p className="text-muted mt-1">{STUDENT_UR.classes.trainerLabel(session.trainerName)}</p>
                    {session.notes && (
                      <p className="text-sm text-muted mt-2 bg-background rounded-lg p-3 border border-border">
                        {session.notes}
                      </p>
                    )}
                  </div>
                  {isUpcoming &&
                    (session.hasJoinLink ? (
                      <JoinClassButton sessionId={session.id} />
                    ) : (
                      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shrink-0">
                        <p className="font-semibold">{STUDENT_UR.classes.linkSoon}</p>
                        <p className="mt-1 text-xs">{STUDENT_UR.classes.linkSoonHint}</p>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
