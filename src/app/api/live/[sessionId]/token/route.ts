import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionById } from "@/lib/api/portal-data";
import { isWithinJoinWindow } from "@/lib/sessions/join-window";
import { createApiResponse } from "@/lib/api/enrollment";
import { isLiveKitConfigured, getLiveKitConfig } from "@/lib/livekit/config";
import { createLiveKitAccessToken } from "@/lib/livekit/tokens";
import { resolveLiveSessionAccess } from "@/lib/livekit/session-access";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      createApiResponse(false, {
        message: "Portal video is not configured yet. Ask admin to add LiveKit keys.",
      }),
      { status: 503 }
    );
  }

  const { sessionId } = await params;
  const session = await getLiveSessionById(sessionId);

  if (!session) {
    return NextResponse.json(createApiResponse(false, { error: "Class not found" }), {
      status: 404,
    });
  }

  const access = resolveLiveSessionAccess(session, user);
  if (!access.allowed) {
    return NextResponse.json(createApiResponse(false, { error: access.error }), {
      status: 403,
    });
  }

  if (access.role === "student" && !isWithinJoinWindow(session.date, session.time)) {
    return NextResponse.json(
      createApiResponse(false, {
        message: "Join opens 30 minutes before class and closes 3 hours after start.",
      }),
      { status: 403 }
    );
  }

  const waitingRoom = access.role === "student";
  const token = await createLiveKitAccessToken({
    sessionId: session.id,
    userId: user.id,
    userName: user.name,
    role: access.role,
    waitingRoom,
  });

  const { url } = getLiveKitConfig();

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        token,
        url,
        sessionTitle: session.title,
        role: access.role,
        waitingRoom,
      },
    })
  );
}
