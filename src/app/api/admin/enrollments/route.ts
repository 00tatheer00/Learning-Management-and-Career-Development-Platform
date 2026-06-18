import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getEnrollments, updateEnrollmentStatus } from "@/lib/api/portal-data";
import { createUser, getUserByEmail } from "@/lib/auth/users";
import { createApiResponse } from "@/lib/api/enrollment";
import { z } from "zod";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }
  const enrollments = await getEnrollments();
  return NextResponse.json(createApiResponse(true, { data: enrollments }));
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected"]),
  adminNotes: z.string().optional(),
  createStudentAccount: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const enrollment = await updateEnrollmentStatus(
    parsed.data.id,
    parsed.data.status,
    user.id,
    parsed.data.adminNotes
  );

  if (!enrollment) {
    return NextResponse.json(createApiResponse(false, { error: "Not found" }), {
      status: 404,
    });
  }

  if (parsed.data.status === "approved" && parsed.data.createStudentAccount) {
    const existing = await getUserByEmail(enrollment.email);
    if (!existing) {
      await createUser({
        email: enrollment.email,
        password: enrollment.cnic.slice(-6),
        role: "student",
        name: enrollment.fullName,
        phone: enrollment.whatsapp,
        programSlug: enrollment.program,
        level: enrollment.level,
        isActive: true,
        avatarInitials: enrollment.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      });
    }
  }

  return NextResponse.json(
    createApiResponse(true, { data: enrollment, message: `Registration ${parsed.data.status}` })
  );
}
