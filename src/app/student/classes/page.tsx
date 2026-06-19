import { CalendarBlank } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionsPreview } from "@/lib/api/portal-data";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { JoinClassButton } from "@/components/portal/join-class-button";

export default async function StudentClassesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const sessions = await getLiveSessionsPreview(user.programSlug ?? "web-development");
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <PortalPageHeader
        title="Live Classes"
        description="Join your online class using the button below. Be ready 5 minutes early."
      />

      <p className="mb-6 text-sm text-muted rounded-xl border border-border bg-surface p-4">
        Class links are only shown to enrolled students at class time. Do not share your portal
        login or class link with anyone outside your batch. Trainers use waiting room to admit
        only registered students.
      </p>

      {sessions.length === 0 ? (
        <EmptyState
          title="No classes scheduled"
          description="Your trainer will post the next class here. Also check WhatsApp."
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
                  {isUpcoming && <JoinClassButton sessionId={session.id} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
