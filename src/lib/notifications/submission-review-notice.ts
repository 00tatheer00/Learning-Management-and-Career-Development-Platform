interface SubmissionReviewNoticeInput {
  studentName: string;
  email: string;
  assignmentTitle: string;
  status: "approved" | "needs_revision";
  feedback?: string;
}

export async function sendSubmissionReviewNotifications(
  input: SubmissionReviewNoticeInput
): Promise<{ sent: boolean }> {
  void input;
  return { sent: true };
}
