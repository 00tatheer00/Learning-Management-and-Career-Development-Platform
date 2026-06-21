function formatWhatsAppNumber(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0092") && digits.length === 14) {
    digits = digits.slice(4);
  }
  if (digits.startsWith("92") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `+92${digits.slice(1)}`;
  }
  if (digits.length === 10 && !digits.startsWith("0")) {
    return `+92${digits}`;
  }
  return null;
}

interface UltraMsgResponse {
  sent?: string | boolean;
  message?: string;
  error?: string;
  id?: number | string;
}

interface UltraMsgStatusResponse {
  status?: {
    accountStatus?: {
      status?: string;
      substatus?: string;
    };
  };
}

function getUltraMsgCredentials() {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID?.trim();
  const token = process.env.ULTRAMSG_TOKEN?.trim();
  return { instanceId, token };
}

function isQueuedBecauseNotAuthenticated(message?: string): boolean {
  const text = (message ?? "").toLowerCase();
  return (
    text.includes("not authenticated") ||
    text.includes("will be sent after successful authentication")
  );
}

function parseUltraMsgSendResult(data: UltraMsgResponse): { sent: boolean; error?: string } {
  if (data.error) {
    return { sent: false, error: data.error };
  }

  if (isQueuedBecauseNotAuthenticated(data.message)) {
    return {
      sent: false,
      error:
        "UltraMsg WhatsApp is not connected. Open ultramsg.com → your instance → scan QR code, then try again.",
    };
  }

  const sentValue = data.sent;
  const accepted =
    sentValue === true ||
    sentValue === "true" ||
    sentValue === "ok" ||
    Boolean(data.id);

  if (!accepted) {
    return {
      sent: false,
      error: data.message ?? "UltraMsg did not accept the message",
    };
  }

  return { sent: true };
}

export async function getUltraMsgInstanceStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  status?: string;
  error?: string;
}> {
  const { instanceId, token } = getUltraMsgCredentials();

  if (!instanceId || !token) {
    return {
      configured: false,
      connected: false,
      error: "ULTRAMSG_INSTANCE_ID and ULTRAMSG_TOKEN are not set on the server",
    };
  }

  try {
    const response = await fetch(
      `https://api.ultramsg.com/${instanceId}/instance/status?token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    );

    const data = (await response.json()) as UltraMsgStatusResponse;
    const status = data.status?.accountStatus?.status ?? "unknown";
    const connected = status.toLowerCase() === "authenticated";

    return {
      configured: true,
      connected,
      status,
      error: connected
        ? undefined
        : `WhatsApp instance status is "${status}". Scan QR on UltraMsg dashboard.`,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      error: error instanceof Error ? error.message : "Failed to check UltraMsg status",
    };
  }
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
  const { instanceId, token } = getUltraMsgCredentials();

  if (!instanceId || !token) {
    return {
      sent: false,
      error: "WhatsApp service not configured (ULTRAMSG_INSTANCE_ID, ULTRAMSG_TOKEN)",
    };
  }

  const instanceStatus = await getUltraMsgInstanceStatus();
  if (instanceStatus.configured && !instanceStatus.connected) {
    console.warn("UltraMsg status not connected, attempting send anyway:", instanceStatus.error);
  }

  const to = formatWhatsAppNumber(phone);
  if (!to) {
    return {
      sent: false,
      error: `Invalid WhatsApp number "${phone}". Use 03XXXXXXXXX format.`,
    };
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
        cache: "no-store",
      }
    );

    const data = (await response.json()) as UltraMsgResponse;

    if (!response.ok) {
      return {
        sent: false,
        error: data.error ?? data.message ?? "UltraMsg request failed",
      };
    }

    return parseUltraMsgSendResult(data);
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Failed to send WhatsApp message",
    };
  }
}
