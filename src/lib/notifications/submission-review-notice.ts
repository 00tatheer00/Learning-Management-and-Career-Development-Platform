import { sendAssignmentReviewWhatsApp } from "@/lib/notifications/whatsapp";

interface SubmissionReviewNoticeInput {
  studentName: string;
  email: string;
  whatsapp?: string;
  assignmentTitle: string;
  status: "approved" | "needs_revision";
  feedback?: string;
}

function buildText(input: SubmissionReviewNoticeInput): string {
  const statusLabel =
    input.status === "approved" ? "Approved ✓" : "Needs revision — please resubmit";

  return [
    `Dear ${input.studentName},`,
    "",
    `Your assignment "${input.assignmentTitle}" has been reviewed.`,
    "",
    `Status: ${statusLabel}`,
    input.feedback ? `Feedback: ${input.feedback}` : "",
    "",
    "Log in to your student portal to view details.",
    "",
    "— EEST Team",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendSubmissionReviewNotifications(
  input: SubmissionReviewNoticeInput
): Promise<{ whatsappSent: boolean }> {
  const text = buildText(input);
  let whatsappSent = false;

  if (input.whatsapp) {
    const emoji = input.status === "approved" ? "✅" : "📝";
    const result = await sendAssignmentReviewWhatsApp(
      input.whatsapp,
      `${emoji} *Assignment Review*\n\n${text}`
    );
    whatsappSent = result.sent;
  }

  return { whatsappSent };
}
