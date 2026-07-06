import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionById } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { getJitsiDomain, getSessionRoomName } from "@/lib/portal-video/config";
import { resolveLiveSessionAccess } from "@/lib/portal-video/session-access";

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

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        domain: getJitsiDomain(),
        roomName: session.roomName ?? getSessionRoomName(session.id),
        displayName: user.name,
        password: session.roomPassword ?? undefined,
        role: access.role,
      },
    })
  );
}
