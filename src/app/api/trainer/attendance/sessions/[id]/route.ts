import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  assertTrainerOwnsSession,
  getSessionAttendanceDetail,
  manualSetStudentAttendance,
} from "@/lib/api/class-attendance";
import { resolveTrainerId } from "@/lib/auth/trainer-scope";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  const { id } = await params;
  const trainerId = resolveTrainerId(user);
  const owned = await assertTrainerOwnsSession(id, trainerId);
  if (!owned.ok) {
    return NextResponse.json(createApiResponse(false, { error: owned.error }), { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const batch = searchParams.get("batch") ?? undefined;
  const detail = await getSessionAttendanceDetail(id, owned.programSlug, batch);

  if (!detail) {
    return NextResponse.json(createApiResponse(false, { error: "Session not found" }), {
      status: 404,
    });
  }

  return NextResponse.json(createApiResponse(true, { data: detail }));
}

const bodySchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(["present", "late", "absent"]),
  note: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  const { id: sessionId } = await params;
  const trainerId = resolveTrainerId(user);
  const owned = await assertTrainerOwnsSession(sessionId, trainerId);
  if (!owned.ok) {
    return NextResponse.json(createApiResponse(false, { error: owned.error }), { status: 403 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message ?? "Invalid request" }),
      { status: 400 }
    );
  }

  const result = await manualSetStudentAttendance({
    sessionId,
    studentId: parsed.data.studentId,
    status: parsed.data.status,
    markedBy: user.name,
    adminNote: parsed.data.note,
  });

  if (!result.ok) {
    return NextResponse.json(createApiResponse(false, { error: result.error }), { status: 400 });
  }

  return NextResponse.json(
    createApiResponse(true, {
      message:
        parsed.data.status === "absent"
          ? "Attendance cleared — student marked as missed."
          : `Attendance marked as ${parsed.data.status}.`,
    })
  );
}
