import { getProgramBySlug } from "@/lib/data/programs";
import { buildApprovalWhatsAppMessage } from "@/lib/notifications/approval-templates";
import { sendLoginResendWhatsApp } from "@/lib/notifications/whatsapp";
import { decryptPortalPassword } from "@/lib/auth/portal-password-vault";
import { getPortalLoginUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";

export async function sendStudentLoginWhatsApp(input: {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  password: string;
}): Promise<{ sent: boolean; error?: string }> {
  const loginUrl = getPortalLoginUrl();
  const courseName = getProgramBySlug(input.program)?.title ?? input.program;
  const programLevel = getProgramBySlug(input.program)?.level ?? "—";
  const message = buildApprovalWhatsAppMessage({
    studentName: input.fullName,
    email: input.email,
    password: input.password,
    courseName,
    module: input.level,
    level: programLevel,
    loginUrl,
  });

  return sendLoginResendWhatsApp(input.whatsapp, message);
}

export async function resendStudentLoginWhatsApp(studentId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student || student.role !== "student") {
    return { success: false, message: "", error: "Student not found" };
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: { email: student.email.toLowerCase(), status: "approved" },
    orderBy: { reviewedAt: "desc" },
  });

  if (!enrollment) {
    return { success: false, message: "", error: "No approved registration found for this student" };
  }

  const password = decryptPortalPassword(enrollment.portalPasswordEnc);
  if (!password) {
    return {
      success: false,
      message: "",
      error: "Login password not saved. Use Portal Logins → Generate & Save, then resend.",
    };
  }

  const result = await sendStudentLoginWhatsApp({
    fullName: student.name,
    email: student.email,
    whatsapp: student.phone ?? enrollment.whatsapp,
    program: student.programSlug ?? enrollment.program,
    level: student.level ?? enrollment.level,
    password,
  });

  if (!result.sent) {
    return {
      success: false,
      message: "",
      error: result.error ?? "WhatsApp message was not sent",
    };
  }

  return {
    success: true,
    message: `Login details sent on WhatsApp to ${student.phone ?? enrollment.whatsapp}.`,
  };
}
