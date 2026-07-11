import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionById } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { recordClassJoin } from "@/lib/api/class-attendance";
import { recordUserActivity } from "@/lib/auth/user-activity";
import { isPortalRoomSession } from "@/lib/portal-video/config";
import { canStudentAccessModuleContent } from "@/lib/modules/student-module-content";
import { canStudentAccessProgram } from "@/lib/student-portal/program-scope";
import { getJoinWindowState } from "@/lib/sessions/join-window";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: STUDENT_UR.api.unauthorized }), {
      status: 403,
    });
  }

  const { id } = await params;
  const session = await getLiveSessionById(id);

  if (!session) {
    return NextResponse.json(createApiResponse(false, { error: STUDENT_UR.api.classNotFound }), {
      status: 404,
    });
  }

  if (!canStudentAccessProgram(user, session.programSlug)) {
    return NextResponse.json(createApiResponse(false, { error: STUDENT_UR.api.unauthorized }), {
      status: 403,
    });
  }

  if (
    !canStudentAccessModuleContent(session.programSlug, user.level, session.level, {
      email: user.email,
    })
  ) {
    return NextResponse.json(
      createApiResponse(false, {
        message: STUDENT_UR.joinClass.moduleNotStarted,
      }),
      { status: 403 }
    );
  }

  if (!isPortalRoomSession(session) && !session.meetLink?.trim()) {
    return NextResponse.json(
      createApiResponse(false, {
        message: STUDENT_UR.api.linkNotAdded,
      }),
      { status: 403 }
    );
  }

  const joinWindow = getJoinWindowState({
    sessionDate: session.date,
    sessionTime: session.time,
    programSlug: session.programSlug,
    hasJoinLink: true,
  });

  if (!joinWindow.canJoin) {
    return NextResponse.json(
      createApiResponse(false, {
        message: joinWindow.hint,
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
