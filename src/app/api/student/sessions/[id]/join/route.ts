import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionById } from "@/lib/api/portal-data";
import { isWithinJoinWindow } from "@/lib/sessions/join-window";
import { createApiResponse } from "@/lib/api/enrollment";
import { recordClassJoin } from "@/lib/api/class-attendance";
import { recordUserActivity } from "@/lib/auth/user-activity";
import { isPortalRoomSession } from "@/lib/livekit/config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const { id } = await params;
  const session = await getLiveSessionById(id);

  if (!session) {
    return NextResponse.json(createApiResponse(false, { error: "Class not found" }), {
      status: 404,
    });
  }

  if (session.programSlug !== user.programSlug) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  if (!isWithinJoinWindow(session.date, session.time)) {
    return NextResponse.json(
      createApiResponse(false, {
        message: "Join button opens 30 minutes before class and closes 3 hours after start.",
      }),
      { status: 403 }
    );
  }

  void recordUserActivity(user.id);

  const attendance = await recordClassJoin({
    sessionId: session.id,
    studentId: user.id,
    studentName: user.name,
    programSlug: session.programSlug,
    sessionDate: session.date,
    sessionTime: session.time,
  });

  return NextResponse.json(
    createApiResponse(true, {
      data: isPortalRoomSession(session)
        ? {
            roomType: "portal" as const,
            livePath: `/student/classes/${session.id}/live`,
            attendance: attendance.status,
          }
        : {
            roomType: "meet" as const,
            meetLink: session.meetLink,
            attendance: attendance.status,
          },
    })
  );
}
