function formatWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+92${digits.slice(1)}`;
  if (digits.length === 10) return `+92${digits}`;
  return null;
}

interface UltraMsgResponse {
  sent?: string;
  message?: string;
  error?: string;
}

export async function sendApprovalWhatsApp(
  phone: string,
  message: string
): Promise<{ sent: boolean; error?: string }> {
  return sendWhatsAppMessage(phone, message);
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<{ sent: boolean; error?: string }> {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;

  if (!instanceId || !token) {
    return {
      sent: false,
      error: "WhatsApp service not configured (ULTRAMSG_INSTANCE_ID, ULTRAMSG_TOKEN)",
    };
  }

  const to = formatWhatsAppNumber(phone);
  if (!to) {
    return { sent: false, error: "Invalid WhatsApp number format" };
  }

  try {
    const body = new URLSearchParams({
      token,
      to,
      body: message,
      priority: "10",
    });

    const response = await fetch(
      `https://api.ultramsg.com/${instanceId}/messages/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    const data = (await response.json()) as UltraMsgResponse;

    if (!response.ok || data.error) {
      return {
        sent: false,
        error: data.error ?? data.message ?? "UltraMsg request failed",
      };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Failed to send WhatsApp message",
    };
  }
}
