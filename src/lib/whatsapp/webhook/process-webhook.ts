import { prisma } from "@/lib/prisma";
import { whatsappLogger } from "@/lib/whatsapp/logger";
import {
  processInboundWhatsAppMessage,
  processWhatsAppStatusUpdate,
} from "@/lib/whatsapp/webhook/process-inbound";
import type { WhatsAppWebhookPayload } from "@/lib/whatsapp/webhook/types";

export interface WebhookProcessResult {
  ok: boolean;
  duplicate: boolean;
  eventKey: string;
  eventType: string;
  inboundStored: number;
  statusesUpdated: number;
}

function buildEventKey(parts: {
  messageId?: string;
  statusId?: string;
  status?: string;
  statusTs?: string;
  errorCode?: number;
  fallback: string;
}): string {
  if (parts.messageId) return `msg:${parts.messageId}`;
  if (parts.statusId && parts.status) {
    return `status:${parts.statusId}:${parts.status}:${parts.statusTs ?? ""}`;
  }
  if (parts.errorCode != null) return `error:${parts.errorCode}:${parts.fallback}`;
  return `raw:${parts.fallback}`;
}

async function recordWebhookEvent(eventKey: string, eventType: string): Promise<boolean> {
  const existing = await prisma.whatsAppWebhookEvent.findUnique({
    where: { eventKey },
    select: { id: true },
  });
  if (existing) return false;

  await prisma.whatsAppWebhookEvent.create({
    data: {
      id: crypto.randomUUID(),
      eventKey,
      eventType,
    },
  });
  return true;
}

export async function processWhatsAppWebhook(
  payload: WhatsAppWebhookPayload
): Promise<WebhookProcessResult> {
  let inboundStored = 0;
  let statusesUpdated = 0;
  let primaryEventKey = "batch";
  let primaryEventType = "unknown";
  let anyProcessed = false;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;

      if (value.messages?.length) {
        primaryEventType = "messages";
        for (const message of value.messages) {
          const eventKey = buildEventKey({ messageId: message.id, fallback: entry.id });
          primaryEventKey = eventKey;
          const isNew = await recordWebhookEvent(eventKey, "messages");
          if (!isNew) {
            whatsappLogger.info("Duplicate inbound webhook skipped", { eventKey });
            continue;
          }
          anyProcessed = true;
          const result = await processInboundWhatsAppMessage({ message, value });
          if (result.stored) inboundStored += 1;
        }
      }

      if (value.statuses?.length) {
        primaryEventType = "statuses";
        for (const status of value.statuses) {
          const eventKey = buildEventKey({
            statusId: status.id,
            status: status.status,
            statusTs: status.timestamp,
            fallback: entry.id,
          });
          primaryEventKey = eventKey;
          const isNew = await recordWebhookEvent(eventKey, "statuses");
          if (!isNew) continue;
          anyProcessed = true;
          const updated = await processWhatsAppStatusUpdate(status);
          if (updated) statusesUpdated += 1;
        }
      }

      if (value.errors?.length) {
        primaryEventType = "errors";
        for (const error of value.errors) {
          const eventKey = buildEventKey({
            errorCode: error.code,
            fallback: `${entry.id}:${error.code ?? "unknown"}`,
          });
          await recordWebhookEvent(eventKey, "errors");
          whatsappLogger.error("WhatsApp webhook error payload", undefined, {
            code: error.code,
            title: error.title,
            message: error.message,
          });
        }
      }
    }
  }

  if (!anyProcessed && payload.entry?.length) {
    const fallbackKey = buildEventKey({
      fallback: JSON.stringify(payload).slice(0, 200),
    });
    await recordWebhookEvent(fallbackKey, "unknown");
    primaryEventKey = fallbackKey;
  }

  whatsappLogger.info("Webhook batch processed", {
    inboundStored,
    statusesUpdated,
    eventType: primaryEventType,
  });

  return {
    ok: true,
    duplicate: !anyProcessed && inboundStored === 0 && statusesUpdated === 0,
    eventKey: primaryEventKey,
    eventType: primaryEventType,
    inboundStored,
    statusesUpdated,
  };
}
