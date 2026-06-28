export type LiveRoomRole = "host" | "student" | "admin";

export function isLiveKitConfigured(): boolean {
  return Boolean(
    process.env.LIVEKIT_API_KEY?.trim() &&
      process.env.LIVEKIT_API_SECRET?.trim() &&
      process.env.LIVEKIT_URL?.trim()
  );
}

export function getLiveKitConfig() {
  if (!isLiveKitConfigured()) {
    throw new Error("LiveKit is not configured on the server.");
  }

  return {
    apiKey: process.env.LIVEKIT_API_KEY!.trim(),
    apiSecret: process.env.LIVEKIT_API_SECRET!.trim(),
    url: process.env.LIVEKIT_URL!.trim(),
  };
}

export function getSessionRoomName(sessionId: string): string {
  return `eest-class-${sessionId}`;
}

export function isPortalRoomSession(session: { roomType?: string | null }): boolean {
  return session.roomType === "portal";
}
