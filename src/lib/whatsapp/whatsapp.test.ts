import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { formatWhatsAppNumberE164, formatWhatsAppWaId } from "@/lib/whatsapp/phone";
import { verifyWhatsAppWebhookSignature } from "@/lib/whatsapp/webhook/signature";

describe("whatsapp phone", () => {
  it("normalizes Pakistani mobile numbers", () => {
    expect(formatWhatsAppNumberE164("03001234567")).toBe("+923001234567");
    expect(formatWhatsAppWaId("03001234567")).toBe("923001234567");
  });
});

describe("whatsapp webhook signature", () => {
  it("verifies valid sha256 signatures", () => {
    const secret = "test-secret";
    const body = '{"object":"whatsapp_business_account"}';
    const digest = createHmac("sha256", secret).update(body, "utf8").digest("hex");

    expect(verifyWhatsAppWebhookSignature(body, `sha256=${digest}`, secret)).toBe(true);
    expect(verifyWhatsAppWebhookSignature(body, "sha256=invalid", secret)).toBe(false);
  });
});
