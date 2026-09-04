import { describe, expect, it } from "vitest";
import {
  sanitizeWhatsAppPhone,
  buildWhatsAppChatUrl,
  formatApprovalWhatsAppMessage,
  formatRejectionWhatsAppMessage,
} from "./whatsapp-templates";

describe("whatsapp-templates utilities", () => {
  describe("sanitizeWhatsAppPhone", () => {
    it("converts standard Pakistani 11-digit local format to 12-digit international", () => {
      expect(sanitizeWhatsAppPhone("03001234567")).toBe("923001234567");
      expect(sanitizeWhatsAppPhone("03459876543")).toBe("923459876543");
      expect(sanitizeWhatsAppPhone("03115969527")).toBe("923115969527");
    });

    it("handles spaced, hyphenated, and bracketed numbers", () => {
      expect(sanitizeWhatsAppPhone("+92 300 1234567")).toBe("923001234567");
      expect(sanitizeWhatsAppPhone("0300-1234567")).toBe("923001234567");
      expect(sanitizeWhatsAppPhone("+92 (300) 123-4567")).toBe("923001234567");
    });

    it("handles already internationalized 92... or 0092... numbers", () => {
      expect(sanitizeWhatsAppPhone("923001234567")).toBe("923001234567");
      expect(sanitizeWhatsAppPhone("00923001234567")).toBe("923001234567");
    });

    it("returns null for empty or invalid numbers", () => {
      expect(sanitizeWhatsAppPhone("")).toBeNull();
      expect(sanitizeWhatsAppPhone("12345")).toBeNull();
      expect(sanitizeWhatsAppPhone(null)).toBeNull();
      expect(sanitizeWhatsAppPhone(undefined)).toBeNull();
    });
  });

  describe("buildWhatsAppChatUrl", () => {
    it("builds a wa.me URL with clean phone and url-encoded message", () => {
      const url = buildWhatsAppChatUrl("03001234567", "Hello Student");
      expect(url).toBe("https://wa.me/923001234567?text=Hello%20Student");
    });

    it("handles special characters in message", () => {
      const url = buildWhatsAppChatUrl("03001234567", "🎉 Congratulations! *Approved*");
      expect(url).toContain("https://wa.me/923001234567?text=");
      expect(decodeURIComponent(url)).toContain("🎉 Congratulations! *Approved*");
    });
  });

  describe("formatApprovalWhatsAppMessage", () => {
    it("formats approval template with credentials and portal url", () => {
      const msg = formatApprovalWhatsAppMessage({
        studentName: "Ahmad Raza",
        courseTitle: "Full Stack Web & App Development",
        moduleName: "Module 1",
        email: "ahmad@example.com",
        password: "TempPassword123!",
        portalUrl: "https://summer-portal.vercel.app/login",
      });

      expect(msg).toContain("Ahmad Raza");
      expect(msg).toContain("Full Stack Web & App Development");
      expect(msg).toContain("Module 1");
      expect(msg).toContain("ahmad@example.com");
      expect(msg).toContain("TempPassword123!");
      expect(msg).toContain("https://summer-portal.vercel.app/login");
      expect(msg).toContain("APPROVED");
    });

    it("gracefully falls back when password is not provided or masked", () => {
      const msg = formatApprovalWhatsAppMessage({
        studentName: "Sara Ali",
        courseTitle: "Python AI & Data Science",
        email: "sara@example.com",
      });

      expect(msg).toContain("Sent to your registered email");
    });
  });

  describe("formatRejectionWhatsAppMessage", () => {
    it("formats rejection template with custom reason", () => {
      const msg = formatRejectionWhatsAppMessage({
        studentName: "Usman Tariq",
        courseTitle: "Cyber Security Fundamentals",
        moduleName: "Module 1",
        reason: "Payment screenshot is unclear. Please register again with a clear proof.",
      });

      expect(msg).toContain("Usman Tariq");
      expect(msg).toContain("Cyber Security Fundamentals");
      expect(msg).toContain("Payment screenshot is unclear");
      expect(msg).toContain("Admissions Team");
    });

    it("falls back to default reason if none provided", () => {
      const msg = formatRejectionWhatsAppMessage({
        studentName: "Usman Tariq",
        courseTitle: "Web Development",
      });

      expect(msg).toContain("Incomplete verification or payment proof could not be verified");
    });
  });
});
