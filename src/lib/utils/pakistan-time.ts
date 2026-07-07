export const PAKISTAN_TZ = "Asia/Karachi";

/** YYYY-MM-DD in Pakistan (Asia/Karachi), not UTC. */
export function getTodayYmdInPakistan(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: PAKISTAN_TZ });
}

/** Minutes since midnight in Pakistan. */
export function getPakistanTimeMinutes(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PAKISTAN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function parseTimeToMinutes(time: string): number {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function addDaysToYmd(ymd: string, days: number): string {
  const date = new Date(`${ymd}T12:00:00+05:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getWeekdayFromYmd(ymd: string): number {
  return new Date(`${ymd}T12:00:00+05:00`).getUTCDay();
}

export function formatYmdInPakistan(
  ymd: string,
  options?: { weekday?: boolean; month?: "short" | "long" }
): string {
  const date = new Date(`${ymd}T12:00:00+05:00`);
  return date.toLocaleDateString("en-US", {
    timeZone: PAKISTAN_TZ,
    weekday: options?.weekday ? "long" : undefined,
    month: options?.month ?? "long",
    day: "numeric",
    year: "numeric",
  });
}
