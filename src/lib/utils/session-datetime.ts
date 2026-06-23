export function parseSessionDateTime(date: string, time: string): Date | null {
  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return null;

  const timeMatch = time.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const seconds = timeMatch[3] ? Number(timeMatch[3]) : 0;
  const meridiem = timeMatch[4]?.toUpperCase();

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]) - 1;
  const day = Number(dateMatch[3]);

  const parsed = new Date(year, month, day, hours, minutes, seconds, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

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
  T extends { date: string; time: string; id: string }
>(sessions: T[], now = new Date()): T | null {
  const upcoming = sessions
    .map((session) => ({
      session,
      at: parseSessionDateTime(session.date, session.time),
    }))
    .filter((item): item is { session: T; at: Date } => item.at !== null && item.at >= now)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  return upcoming[0]?.session ?? null;
}
