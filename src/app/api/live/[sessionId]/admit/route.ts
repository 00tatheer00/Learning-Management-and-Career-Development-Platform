import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionById } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { isLiveKitConfigured } from "@/lib/livekit/config";
import { admitParticipantToLiveRoom } from "@/lib/livekit/tokens";
import { resolveLiveSessionAccess } from "@/lib/livekit/session-access";

const schema = z.object({
  participantId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!isLiveKitConfigured()) {
    return NextResponse.json(createApiResponse(false, { error: "LiveKit not configured" }), {
      status: 503,
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
  if (!access.allowed || (access.role !== "host" && access.role !== "admin")) {
    return NextResponse.json(createApiResponse(false, { error: "Only host can admit students" }), {
      status: 403,
    });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(createApiResponse(false, { message: "Invalid participant" }), {
      status: 400,
    });
  }

  try {
    await admitParticipantToLiveRoom(sessionId, parsed.data.participantId);
    return NextResponse.json(createApiResponse(true, { message: "Student admitted" }));
  } catch (error) {
    return NextResponse.json(
      createApiResponse(false, {
        error: error instanceof Error ? error.message : "Could not admit student",
      }),
      { status: 500 }
    );
  }
}
