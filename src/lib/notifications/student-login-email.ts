import { getProgramBySlug } from "@/lib/data/programs";
import { sendApprovalEmail } from "@/lib/notifications/email";
import {
  getEnrollmentPortalPasswordForWhatsApp,
  getStudentPortalPasswordForWhatsApp,
} from "@/lib/api/admin-portal-password";
import { getPortalLoginUrl } from "@/lib/site-url";

export async function sendStudentLoginEmail(input: {
  fullName: string;
  email: string;
  program: string;
  level: string;
  password: string;
}): Promise<{ sent: boolean; error?: string }> {
  const loginUrl = getPortalLoginUrl();
  const courseName = getProgramBySlug(input.program)?.title ?? input.program;
  const programLevel = getProgramBySlug(input.program)?.level ?? "—";

  return sendApprovalEmail({
    to: input.email,
    studentName: input.fullName,
    email: input.email,
    password: input.password,
    courseName,
    level: programLevel,
    loginUrl,
  });
}

export async function resendEnrollmentLoginEmail(enrollmentId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  const lookup = await getEnrollmentPortalPasswordForWhatsApp(enrollmentId);
  if (!lookup.password || !lookup.enrollment) {
    return {
      success: false,
      message: "",
      error: lookup.error ?? "Login password not available",
    };
  }

  const { student, enrollment, password } = lookup;

  const result = await sendStudentLoginEmail({
    fullName: student.name,
    email: student.email,
    program: enrollment.program,
    level: enrollment.level,
    password,
  });

  if (!result.sent) {
    return {
      success: false,
      message: "",
      error: result.error ?? "Email was not sent",
    };
  }

  return {
    success: true,
    message: `Login details emailed to ${student.email}.`,
  };
}

export async function resendStudentLoginEmail(studentId: string): Promise<{
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

  const result = await sendStudentLoginEmail({
    fullName: student.name,
    email: student.email,
    program: student.programSlug ?? enrollment.program,
    level: student.level ?? enrollment.level,
    password,
  });

  if (!result.sent) {
    return {
      success: false,
      message: "",
      error: result.error ?? "Email was not sent",
    };
  }

  return {
    success: true,
    message: `Login details emailed to ${student.email}.`,
  };
}
