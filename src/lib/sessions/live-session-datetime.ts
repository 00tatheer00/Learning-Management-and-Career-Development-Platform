import { PAKISTAN_TZ } from "@/lib/utils/pakistan-time";

export const DEFAULT_SESSION_TIMEZONE = PAKISTAN_TZ;

function parseTimeToMinutes(time: string): number | null {
  const trimmed = time.trim();
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  const twentyFourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);

  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2]);
    const period = ampmMatch[4].toUpperCase();
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  if (twentyFourMatch) {
    return Number(twentyFourMatch[1]) * 60 + Number(twentyFourMatch[2]);
  }

  return null;
}

function formatMinutesTo12h(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** Parse class date + time as an instant in the given timezone (default Pakistan). */
export function sessionLocalToStartsAt(
  date: string,
  time: string,
  timezone: string = DEFAULT_SESSION_TIMEZONE
): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const minutes = parseTimeToMinutes(time);
  if (minutes === null) return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (timezone === DEFAULT_SESSION_TIMEZONE) {
    return new Date(
      `${date}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00+05:00`
    );
  }

  const probe = new Date(`${date}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  }).formatToParts(probe);
  const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const offsetMatch = offsetPart.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  const sign = offsetMatch?.[1]?.startsWith("-") ? "-" : "+";
  const offsetHours = Math.abs(Number(offsetMatch?.[1] ?? 0));
  const offsetMinutes = Number(offsetMatch?.[2] ?? 0);
  const offset = `${sign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;

  return new Date(
    `${date}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00${offset}`
  );
}

export function startsAtToSessionDisplay(
  startsAt: Date,
  timezone: string = DEFAULT_SESSION_TIMEZONE
): { date: string; time: string } {
  const date = startsAt.toLocaleDateString("en-CA", { timeZone: timezone });
  const minutes = (() => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(startsAt);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return hour * 60 + minute;
  })();

  return { date, time: formatMinutesTo12h(minutes) };
}

export function buildLiveSessionTimestamps(
  date: string,
  time: string,
  timezone: string = DEFAULT_SESSION_TIMEZONE
): { startsAt: Date; date: string; time: string; timezone: string } | null {
  const startsAt = sessionLocalToStartsAt(date, time, timezone);
  if (!startsAt) return null;
  const display = startsAtToSessionDisplay(startsAt, timezone);
  return { startsAt, date: display.date, time: display.time, timezone };
}

export function resolveLiveSessionTimestamps(record: {
  date: string;
  time: string;
  startsAt?: Date | null;
  timezone?: string | null;
}): { startsAt: Date; date: string; time: string; timezone: string } {
  const timezone = record.timezone ?? DEFAULT_SESSION_TIMEZONE;

  if (record.startsAt) {
    const display = startsAtToSessionDisplay(record.startsAt, timezone);
    return { startsAt: record.startsAt, date: display.date, time: display.time, timezone };
  }

  const built = buildLiveSessionTimestamps(record.date, record.time, timezone);
  if (built) return built;

  const fallback = new Date(`${record.date}T12:00:00+05:00`);
  return {
    startsAt: fallback,
    date: record.date,
    time: record.time,
    timezone,
  };
}

/** Canonical parser used by join windows, countdowns, and sorting. */
export function parseSessionDateTime(
  date: string,
  time: string,
  timezone: string = DEFAULT_SESSION_TIMEZONE
): Date | null {
  return sessionLocalToStartsAt(date, time, timezone);
}
