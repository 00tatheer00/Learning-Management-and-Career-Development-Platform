import { getProgramBySlug } from "@/lib/data/programs";
import { buildApprovalWhatsAppMessage } from "@/lib/notifications/approval-templates";
import { sendLoginResendWhatsApp } from "@/lib/notifications/whatsapp";
import { getStudentPortalPasswordForWhatsApp } from "@/lib/api/admin-portal-password";
import { getPortalLoginUrl } from "@/lib/site-url";

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
  const lookup = await getStudentPortalPasswordForWhatsApp(studentId);
  if (!lookup.password || !lookup.enrollment) {
    return {
      success: false,
      message: "",
      error: lookup.error ?? "Login password not available",
    };
  }

  const { student, enrollment, password } = lookup;

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
