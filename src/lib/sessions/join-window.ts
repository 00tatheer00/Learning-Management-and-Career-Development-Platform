const JOIN_EARLY_MS = 30 * 60 * 1000;
const JOIN_LATE_MS = 3 * 60 * 60 * 1000;

export function parseSessionDateTime(date: string, time: string): Date | null {
  const trimmed = time.trim();
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const twentyFourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);

  let hours: number;
  let minutes: number;

  if (ampmMatch) {
    hours = Number(ampmMatch[1]);
    minutes = Number(ampmMatch[2]);
    const period = ampmMatch[3].toUpperCase();
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  } else if (twentyFourMatch) {
    hours = Number(twentyFourMatch[1]);
    minutes = Number(twentyFourMatch[2]);
  } else {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function isWithinJoinWindow(
  date: string,
  time: string,
  now = new Date()
): boolean {
  const start = parseSessionDateTime(date, time);
  if (!start) {
    const today = now.toISOString().split("T")[0];
    return date === today;
  }

  const early = start.getTime() - JOIN_EARLY_MS;
  const late = start.getTime() + JOIN_LATE_MS;
  return now.getTime() >= early && now.getTime() <= late;
}
