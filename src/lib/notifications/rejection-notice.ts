interface RejectionNoticeInput {
  fullName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  program: string;
  level: string;
  reason?: string;
}

export async function sendRejectionNotifications(
  input: RejectionNoticeInput
): Promise<{ emailSent: boolean; warnings: string[] }> {
  void input;
  return { emailSent: false, warnings: [] };
}
