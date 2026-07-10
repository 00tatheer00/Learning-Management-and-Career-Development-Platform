import { NextResponse } from "next/server";
import { z } from "zod";
import {
  requireAdminWrite,
  isNextResponse,
} from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { manualSetStudentAttendance } from "@/lib/api/class-attendance";

const bodySchema = z.object({
  sessionId: z.string().min(1),
  studentId: z.string().min(1),
  status: z.enum(["present", "late", "absent"]),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const user = await requireAdminWrite(request);
  if (isNextResponse(user)) return user;

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message ?? "Invalid request" }),
      { status: 400 }
    );
  }

  const result = await manualSetStudentAttendance({
    sessionId: parsed.data.sessionId,
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
