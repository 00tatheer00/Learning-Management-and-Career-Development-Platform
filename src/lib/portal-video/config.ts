export type LiveRoomRole = "host" | "student" | "admin";

export function getJitsiDomain(): string {
  return process.env.JITSI_DOMAIN?.trim() || "meet.jit.si";
}

export function isPortalVideoAvailable(): boolean {
  return true;
}

export function getSessionRoomName(sessionId: string): string {
  return `EEST-${sessionId.replace(/-/g, "").slice(0, 20)}`;
}

export function isPortalRoomSession(session: { roomType?: string | null }): boolean {
  return session.roomType === "portal";
}

export function generateRoomPassword(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}
