import { parseSessionDateTime } from "@/lib/sessions/live-session-datetime";
import { getSessionEndDateTime } from "@/lib/sessions/join-window";

export { parseSessionDateTime };

export function getSessionCountdownParts(target: Date, now = new Date()) {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { diffMs: 0, label: "Starting now", isPast: true, isSoon: true };
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  let label: string;
  if (days > 0) label = `${days} day${days === 1 ? "" : "s"}, ${hours}h ${minutes}m`;
  else if (hours > 0) label = `${hours}h ${minutes}m`;
  else label = `${minutes} min`;

  return {
    diffMs,
    label,
    isPast: false,
    isSoon: diffMs <= 60 * 60 * 1000,
  };
}

export function findNextUpcomingSession<
  T extends { date: string; time: string; id: string; programSlug?: string }
>(sessions: T[], programSlug?: string, now = new Date()): T | null {
  const slug = programSlug ?? sessions[0]?.programSlug ?? "web-development";

  const activeOrUpcoming = sessions
    .map((session) => {
      const startsAt = parseSessionDateTime(session.date, session.time);
      const endsAt =
        getSessionEndDateTime(session.date, session.programSlug ?? slug) ??
        (startsAt ? new Date(startsAt.getTime() + 60 * 60 * 1000) : null);
      return { session, startsAt, endsAt };
    })
    .filter(
      (item): item is { session: T; startsAt: Date; endsAt: Date } =>
        item.startsAt !== null && item.endsAt !== null && now.getTime() <= item.endsAt.getTime()
    )
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return activeOrUpcoming[0]?.session ?? null;
}
