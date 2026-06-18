import { VideoCamera, CalendarBlank } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessions } from "@/lib/api/portal-data";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";

export default async function StudentClassesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const sessions = await getLiveSessions(user.programSlug ?? "web-development");
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <PortalPageHeader
        title="Live Classes"
        description="Join your online class using the button below. Be ready 5 minutes early."
      />

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
                  {isUpcoming && (
                    <Button size="lg" className="shrink-0 h-14 text-base" asChild>
                      <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                        <VideoCamera size={22} weight="duotone" />
                        Join Class
                      </a>
                    </Button>
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
