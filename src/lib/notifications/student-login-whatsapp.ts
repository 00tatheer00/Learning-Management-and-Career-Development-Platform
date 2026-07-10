import { getProgramBySlug } from "@/lib/data/programs";
import { buildStudentLoginWhatsAppMessage } from "@/lib/notifications/approval-templates";
import { sendLoginResendWhatsApp } from "@/lib/notifications/whatsapp";
import {
  getEnrollmentPortalPasswordForWhatsApp,
  getStudentPortalPasswordForWhatsApp,
} from "@/lib/api/admin-portal-password";
import {
  findConversationByPhone,
  getWhatsAppConversationMessagingWindow,
} from "@/lib/api/whatsapp-crm";
import {
  BUSINESS_WHATSAPP_DISPLAY,
  PORTAL_LOGIN_REQUEST_PHRASE,
} from "@/lib/constants/contact";
import { getPortalLoginUrl } from "@/lib/site-url";

const LOGIN_WINDOW_CLOSED =
  `Student ne abhi business number par message nahi kiya. Pehle unse ${BUSINESS_WHATSAPP_DISPLAY} par "${PORTAL_LOGIN_REQUEST_PHRASE}" likh kar message karwao, phir Admin → WhatsApp se login bhejo.`;

export async function sendStudentLoginWhatsApp(input: {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  password: string;
}): Promise<{ sent: boolean; error?: string }> {
  const conversation = await findConversationByPhone(input.whatsapp);
  if (!conversation) {
    return { sent: false, error: LOGIN_WINDOW_CLOSED };
  }

  const window = await getWhatsAppConversationMessagingWindow(conversation.id);
  if (!window.canSendFreeText) {
    return { sent: false, error: LOGIN_WINDOW_CLOSED };
  }

  const loginUrl = getPortalLoginUrl();
  const courseName = getProgramBySlug(input.program)?.title ?? input.program;
  const programLevel = getProgramBySlug(input.program)?.level ?? "—";
  const message = buildStudentLoginWhatsAppMessage({
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

export async function resendEnrollmentLoginWhatsApp(enrollmentId: string): Promise<{
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

  const result = await sendStudentLoginWhatsApp({
    fullName: student.name,
    email: student.email,
    whatsapp: student.phone ?? enrollment.whatsapp,
    program: enrollment.program,
    level: enrollment.level,
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
