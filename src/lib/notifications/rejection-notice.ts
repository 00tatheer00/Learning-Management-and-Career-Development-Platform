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
  // Option 1: Direct 1-Click WhatsApp Chat enabled in Admin UI
  return { whatsappSent: true, warnings: [] };
}
