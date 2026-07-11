import { Resend } from "resend";
import { formatResendError, getEmailFromAddress, getEmailReplyTo } from "@/lib/notifications/email-config";

export async function sendStudentNotificationEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailFromAddress();

  if (!apiKey || !from) {
    return {
      sent: false,
      error: "Email not configured. Add RESEND_API_KEY and EMAIL_FROM on Vercel.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: getEmailReplyTo(),
    });

    if (error) {
      console.error("Resend student email error:", error);
      return { sent: false, error: formatResendError(error.message) };
    }

    if (!data?.id) {
      return { sent: false, error: "Email API returned no message id" };
    }

    return { sent: true };
  } catch (error) {
    console.error("Send student email failed:", error);
    return {
      sent: false,
      error: error instanceof Error ? formatResendError(error.message) : "Failed to send email",
    };
  }
}
