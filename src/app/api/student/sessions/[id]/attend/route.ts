import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionById } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { recordClassJoin } from "@/lib/api/class-attendance";
import { canAccessModuleOneClasses } from "@/lib/modules/student-module-access";
import { getJoinWindowState } from "@/lib/sessions/join-window";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

/** Idempotent attendance mark when student enters the live room (Meet / portal). */
export async function POST(
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

  if (session.programSlug !== user.programSlug) {
    return NextResponse.json(createApiResponse(false, { error: STUDENT_UR.api.unauthorized }), {
      status: 403,
    });
  }

  if (!canAccessModuleOneClasses(session.programSlug, user.level, undefined, user.email)) {
    return NextResponse.json(
      createApiResponse(false, { message: STUDENT_UR.joinClass.moduleNotStarted }),
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
      createApiResponse(false, { message: joinWindow.hint }),
      { status: 403 }
    );
  }

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
      data: {
        status: attendance.status,
        isNew: attendance.isNew,
      },
    })
  );
}
