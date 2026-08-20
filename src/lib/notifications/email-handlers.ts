import { emailQueue } from "@/lib/queue/email-queue";
import { sendApprovalEmail, sendForgotPasswordEmail } from "@/lib/notifications/email";
import { getProgramBySlug } from "@/lib/data/programs";
import { getPortalLoginUrl } from "@/lib/site-url";

// Register Approval Email Handler
emailQueue.registerHandler<{
  email: string;
  fullName: string;
  password: string;
  program: string;
}>("approval_welcome", async (payload) => {
  const loginUrl = getPortalLoginUrl();
  const courseName = getProgramBySlug(payload.program)?.title ?? payload.program;
  const programLevel = getProgramBySlug(payload.program)?.level ?? "—";

  const res = await sendApprovalEmail({
    to: payload.email,
    studentName: payload.fullName,
    email: payload.email,
    password: payload.password,
    courseName,
    level: programLevel,
    loginUrl,
  });

  return { success: res.sent, error: res.error };
});

// Register Password Reset Email Handler
emailQueue.registerHandler<{
  email: string;
  name: string;
  resetUrl: string;
}>("forgot_password", async (payload) => {
  const res = await sendForgotPasswordEmail({
    to: payload.email,
    studentName: payload.name,
    resetUrl: payload.resetUrl,
  });

  return { success: res.sent, error: res.error };
});

/**
 * Helper to queue an approval welcome email
 */
export function enqueueApprovalEmail(data: {
  email: string;
  fullName: string;
  password: string;
  program: string;
}) {
  return emailQueue.enqueue("approval_welcome", data);
}

/**
 * Helper to queue a password reset email
 */
export function enqueueForgotPasswordEmail(data: {
  email: string;
  name: string;
  resetUrl: string;
}) {
  return emailQueue.enqueue("forgot_password", data);
}
