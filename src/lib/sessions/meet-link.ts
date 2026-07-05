export function normalizeMeetLink(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidMeetLink(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function sessionHasJoinLink(session: {
  roomType?: string | null;
  meetLink?: string | null;
}): boolean {
  if (session.roomType === "portal") return true;
  return Boolean(session.meetLink?.trim());
}
