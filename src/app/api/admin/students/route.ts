import { NextResponse } from "next/server";
import { requireAdminWrite, isNextResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getUserById, updateUser, updateUserPasswordHash } from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/password";
import { generateStudentPassword } from "@/lib/auth/generate-password";
import { sendPasswordResetNotifications } from "@/lib/notifications/password-reset-notice";
import { deleteAdminStudent } from "@/lib/api/admin-students";
import {
  savePortalPasswordForEnrollment,
  savePortalPasswordForStudentEmail,
} from "@/lib/auth/portal-password-vault";
import { getPortalLoginUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    id: z.string(),
    action: z.literal("activate"),
  }),
  z.object({
    id: z.string(),
    action: z.literal("deactivate"),
  }),
  z.object({
    id: z.string(),
    enrollmentId: z.string().optional(),
    action: z.literal("resetPassword"),
  }),
  z.object({
    id: z.string(),
    enrollmentId: z.string().optional(),
    action: z.literal("update"),
    level: z.string().min(1).optional(),
    batch: z.string().min(1).optional(),
  }),
]);

export async function PATCH(request: Request) {
  const admin = await requireAdminWrite();
  if (isNextResponse(admin)) return admin;

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const student = await getUserById(parsed.data.id);
  if (!student || student.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: "Student not found" }), {
      status: 404,
    });
  }

  if (parsed.data.action === "activate") {
    const updated = await updateUser(student.id, { isActive: true });
    return NextResponse.json(
      createApiResponse(true, { data: updated, message: "Student account activated." })
    );
  }

  if (parsed.data.action === "deactivate") {
    const updated = await updateUser(student.id, { isActive: false });
    return NextResponse.json(
      createApiResponse(true, { data: updated, message: "Student account deactivated." })
    );
  }

  if (parsed.data.action === "resetPassword") {
    const plainPassword = generateStudentPassword();
    const enrollmentId = "enrollmentId" in parsed.data ? parsed.data.enrollmentId : undefined;

    if (enrollmentId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        select: { email: true, status: true, level: true, whatsapp: true },
      });

      if (
        !enrollment ||
        enrollment.status !== "approved" ||
        enrollment.email.toLowerCase() !== student.email.toLowerCase()
      ) {
        return NextResponse.json(createApiResponse(false, { error: "Enrollment not found" }), {
          status: 404,
        });
      }

      const saved = await savePortalPasswordForEnrollment(enrollmentId, plainPassword);
      if (!saved) {
        return NextResponse.json(
          createApiResponse(false, {
            error: "Password could not be saved. Check server logs and try again.",
          }),
          { status: 500 }
        );
      }

      const passwordHash = await hashPassword(plainPassword);
      await updateUserPasswordHash(student.id, passwordHash);

      const whatsapp = student.phone ?? enrollment.whatsapp ?? "";
      const notifications = await sendPasswordResetNotifications({
        fullName: student.name,
        email: student.email,
        whatsapp,
        password: plainPassword,
      });

      const parts: string[] = [];
      if (notifications.whatsappSent) parts.push("WhatsApp");

      const notificationSummary =
        parts.length > 0
          ? ` New password sent via ${parts.join(" and ")}.`
          : notifications.warnings.length > 0
            ? ` Password saved but WhatsApp failed: ${notifications.warnings.join("; ")}`
            : ` Password saved for ${enrollment.level}.`;

      return NextResponse.json(
        createApiResponse(true, {
          message: `Password reset for ${enrollment.level}.${notificationSummary}`,
          data: {
            loginId: student.email,
            password: plainPassword,
            loginUrl: getPortalLoginUrl(),
            enrollmentId,
            module: enrollment.level,
          },
        })
      );
    }

    const passwordHash = await hashPassword(plainPassword);
    await updateUserPasswordHash(student.id, passwordHash);
    await savePortalPasswordForStudentEmail(student.email, plainPassword);

    const enrollment = await prisma.enrollment.findFirst({
      where: { email: student.email.toLowerCase(), status: "approved" },
      orderBy: { createdAt: "desc" },
    });

    const whatsapp = student.phone ?? enrollment?.whatsapp ?? "";
    const notifications = await sendPasswordResetNotifications({
      fullName: student.name,
      email: student.email,
      whatsapp,
      password: plainPassword,
    });

    const parts: string[] = [];
    if (notifications.whatsappSent) parts.push("WhatsApp");

    const notificationSummary =
      parts.length > 0
        ? ` New password sent via ${parts.join(" and ")}.`
        : notifications.warnings.length > 0
          ? ` Password saved but WhatsApp failed: ${notifications.warnings.join("; ")}`
          : " Password saved in Portal Logins.";

    return NextResponse.json(
      createApiResponse(true, {
        message: `Password reset.${notificationSummary}`,
        data: {
          loginId: student.email,
          password: plainPassword,
          loginUrl: getPortalLoginUrl(),
        },
      })
    );
  }

  if (!parsed.data.level && !parsed.data.batch) {
    return NextResponse.json(
      createApiResponse(false, { message: "Provide module or batch to update" }),
      { status: 400 }
    );
  }

  const enrollmentId = "enrollmentId" in parsed.data ? parsed.data.enrollmentId : undefined;

  if (enrollmentId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { email: true, status: true, level: true },
    });

    if (
      !enrollment ||
      enrollment.status !== "approved" ||
      enrollment.email.toLowerCase() !== student.email.toLowerCase()
    ) {
      return NextResponse.json(createApiResponse(false, { error: "Enrollment not found" }), {
        status: 404,
      });
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        level: parsed.data.level ?? undefined,
        batch: parsed.data.batch ?? undefined,
      },
    });

    if (
      student.programSlug &&
      student.level === enrollment.level &&
      parsed.data.level &&
      parsed.data.level !== student.level
    ) {
      await updateUser(student.id, { level: parsed.data.level });
    }

    return NextResponse.json(
      createApiResponse(true, {
        data: updatedEnrollment,
        message: "Enrollment module/batch updated.",
      })
    );
  }

  const updated = await updateUser(student.id, {
    level: parsed.data.level ?? student.level,
    batch: parsed.data.batch ?? student.batch,
  });

  return NextResponse.json(
    createApiResponse(true, {
      data: updated,
      message: "Student module/batch updated.",
    })
  );
}

const deleteSchema = z.object({
  id: z.string(),
});

export async function DELETE(request: Request) {
  const admin = await requireAdminWrite();
  if (isNextResponse(admin)) return admin;

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const result = await deleteAdminStudent(parsed.data.id);
  if (!result.success) {
    return NextResponse.json(createApiResponse(false, { error: result.error ?? "Delete failed" }), {
      status: result.error === "Student not found" ? 404 : 400,
    });
  }

  return NextResponse.json(createApiResponse(true, { message: result.message }));
}
