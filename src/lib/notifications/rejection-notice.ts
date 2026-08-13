interface RejectionNoticeInput {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  reason?: string;
}

export async function sendRejectionNotifications(
  input: RejectionNoticeInput
): Promise<{ whatsappSent: boolean; warnings: string[] }> {
  void input;
  return { whatsappSent: false, warnings: [] };
}
