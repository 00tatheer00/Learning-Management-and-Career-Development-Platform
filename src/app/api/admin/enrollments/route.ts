import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getEnrollments, updateEnrollmentStatus, getEnrollmentById } from "@/lib/api/portal-data";
import { createUserWithPasswordHash, getUserByEmail } from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/password";
import { createApiResponse } from "@/lib/api/enrollment";
import { sendApprovalWelcomeNotifications } from "@/lib/notifications/approval-welcome";
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

  let notificationSummary = "";

  if (parsed.data.status === "approved" && parsed.data.createStudentAccount) {
    const enrollmentRecord = await getEnrollmentById(parsed.data.id);
    const existing = await getUserByEmail(enrollment.email);

    if (!existing && enrollmentRecord) {
      const passwordHash =
        enrollmentRecord.passwordHash ??
        (await hashPassword(enrollment.cnic.slice(-6)));

      const avatarInitials = enrollment.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      await createUserWithPasswordHash({
        email: enrollment.email,
        passwordHash,
        role: "student",
        name: enrollment.fullName,
        phone: enrollment.whatsapp,
        programSlug: enrollment.program,
        level: enrollment.level,
        isActive: true,
        avatarInitials,
        avatarUrl: enrollmentRecord.profilePhotoUrl ?? undefined,
      });
    }

    if (enrollmentRecord) {
      const notifications = await sendApprovalWelcomeNotifications({
        id: enrollmentRecord.id,
        fullName: enrollmentRecord.fullName,
        email: enrollmentRecord.email,
        whatsapp: enrollmentRecord.whatsapp,
        program: enrollmentRecord.program,
        level: enrollmentRecord.level,
        cnic: enrollmentRecord.cnic,
        portalPasswordEnc: enrollmentRecord.portalPasswordEnc,
      });

      const parts: string[] = [];
      if (notifications.emailSent) parts.push("email sent");
      if (notifications.whatsappSent) parts.push("WhatsApp sent");
      if (parts.length > 0) {
        notificationSummary = ` Welcome ${parts.join(" and ")}.`;
      } else if (notifications.warnings.length > 0) {
        notificationSummary = ` Account ready, but notifications failed: ${notifications.warnings.join("; ")}`;
      }
    }
  }

  return NextResponse.json(
    createApiResponse(true, {
      data: enrollment,
      message: `Registration ${parsed.data.status}.${notificationSummary}`,
    })
  );
}
