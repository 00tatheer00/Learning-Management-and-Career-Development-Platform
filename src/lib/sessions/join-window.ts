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

/** Students can join any time the trainer has added a link. */
export function isWithinJoinWindow(
  _date: string,
  _time: string,
  _now = new Date()
): boolean {
  return true;
}
