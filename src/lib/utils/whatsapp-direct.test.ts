import { describe, expect, it } from "vitest";
import {
  formatWhatsAppWaId,
  isDummyPhoneNumber,
  getWhatsAppDirectLink,
  buildApprovalWhatsAppMessage,
  buildRejectionWhatsAppMessage,
} from "./whatsapp-direct";

describe("whatsapp-direct utility", () => {
  it("detects placeholder and dummy phone numbers", () => {
    expect(isDummyPhoneNumber("03001234567")).toBe(true);
    expect(isDummyPhoneNumber("+92 300 1234567")).toBe(true);
    expect(isDummyPhoneNumber("12345")).toBe(true);
    expect(isDummyPhoneNumber(null)).toBe(true);
    expect(isDummyPhoneNumber("03115969527")).toBe(false);
    expect(isDummyPhoneNumber("+923374005515")).toBe(false);
  });

  it("formats Pakistani numbers correctly for wa.me links", () => {
    expect(formatWhatsAppWaId("03115969527")).toBe("923115969527");
    expect(formatWhatsAppWaId("+923115969527")).toBe("923115969527");
    expect(formatWhatsAppWaId("923115969527")).toBe("923115969527");
  });

  it("builds wa.me direct links with encoded message text", () => {
    const link = getWhatsAppDirectLink("03115969527", "Hello Ali!");
    expect(link).toBe("https://wa.me/923115969527?text=Hello%20Ali!");
  });

  it("generates approval whatsapp message template", () => {
    const msg = buildApprovalWhatsAppMessage({
      studentName: "Ali Raza",
      programTitle: "Web Development",
      email: "ali@example.com",
    });
    expect(msg).toContain("Assalam-o-Alaikum Ali Raza!");
    expect(msg).toContain("APPROVED");
    expect(msg).toContain("ali@example.com");
  });

  it("generates rejection whatsapp message template", () => {
    const msg = buildRejectionWhatsAppMessage({
      studentName: "Sara Khan",
      programTitle: "App Development",
      reason: "Blurry payment screenshot",
    });
    expect(msg).toContain("Assalam-o-Alaikum Sara Khan");
    expect(msg).toContain("Blurry payment screenshot");
  });
});
