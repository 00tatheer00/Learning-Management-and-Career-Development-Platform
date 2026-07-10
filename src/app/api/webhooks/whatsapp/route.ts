import { NextResponse } from "next/server";
import { getWhatsAppCloudConfig, getWhatsAppWebhookVerifyToken } from "@/lib/whatsapp/config";
import { whatsappLogger } from "@/lib/whatsapp/logger";
import { verifyWhatsAppWebhookSignature } from "@/lib/whatsapp/webhook/signature";
import { processWhatsAppWebhook } from "@/lib/whatsapp/webhook/process-webhook";
import type { WhatsAppWebhookPayload } from "@/lib/whatsapp/webhook/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Meta webhook verification (GET). */
export async function GET(request: Request) {
  const verifyToken = getWhatsAppWebhookVerifyToken();
  if (!verifyToken) {
    return NextResponse.json({ error: "WHATSAPP_WEBHOOK_VERIFY_TOKEN is not set" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === verifyToken && challenge) {
    whatsappLogger.info("Webhook verified successfully");
    return new NextResponse(challenge, { status: 200 });
  }

  whatsappLogger.warn("Webhook verification failed", { mode, hasChallenge: Boolean(challenge) });
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Meta webhook events (POST). */
export async function POST(request: Request) {
  const config = getWhatsAppCloudConfig();
  if (!config) {
    return NextResponse.json({ error: "WhatsApp Cloud API is not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyWhatsAppWebhookSignature(rawBody, signature, config.appSecret)) {
    whatsappLogger.warn("Webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch (error) {
    whatsappLogger.error("Invalid webhook JSON", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.object !== "whatsapp_business_account") {
    whatsappLogger.warn("Unexpected webhook object", { object: payload.object });
    return NextResponse.json({ ok: true });
  }

  try {
    const result = await processWhatsAppWebhook(payload);
    return NextResponse.json(result);
  } catch (error) {
    whatsappLogger.error("Webhook processing failed", error);
    // Meta retries on non-2xx — return 200 after logging to avoid retry storms during rollout
    return NextResponse.json({ ok: false, error: "Processing failed" }, { status: 200 });
  }
}
