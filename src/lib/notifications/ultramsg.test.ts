import { describe, expect, it } from "vitest";
import {
  sanitizeWhatsAppPhone,
  assertZeroLinks,
  formatApprovalWhatsAppMessage,
} from "./ultramsg";

describe("UltraMsg WhatsApp Service - Zero-Link & Sanitization", () => {
  describe("sanitizeWhatsAppPhone", () => {
    it("converts standard Pakistani 11-digit local format to 12-digit international", () => {
      expect(sanitizeWhatsAppPhone("03001234567")).toBe("923001234567");
      expect(sanitizeWhatsAppPhone("03459876543")).toBe("923459876543");
    });

    it("handles spaced, hyphenated, or bracketed numbers", () => {
      expect(sanitizeWhatsAppPhone("+92 300 1234567")).toBe("923001234567");
      expect(sanitizeWhatsAppPhone("0300-1234567")).toBe("923001234567");
      expect(sanitizeWhatsAppPhone("+92 (300) 123-4567")).toBe("923001234567");
    });

    it("handles already formatted 923... or 00923... numbers", () => {
      expect(sanitizeWhatsAppPhone("923001234567")).toBe("923001234567");
      expect(sanitizeWhatsAppPhone("00923001234567")).toBe("923001234567");
    });

    it("returns null for invalid or too short numbers", () => {
      expect(sanitizeWhatsAppPhone("")).toBeNull();
      expect(sanitizeWhatsAppPhone("123")).toBeNull();
      expect(sanitizeWhatsAppPhone(null)).toBeNull();
      expect(sanitizeWhatsAppPhone(undefined)).toBeNull();
    });
  });

  describe("assertZeroLinks & Template Deliverability Safety", () => {
    it("renders approval template correctly with all variables", () => {
      const msg = formatApprovalWhatsAppMessage({
        studentName: "Ali Khan",
        courseTitle: "Full Stack Web & App Development",
        moduleName: "HTML & CSS (Module 1)",
        email: "ali.khan@example.com",
      });

      expect(msg).toContain("Ali Khan");
      expect(msg).toContain("Full Stack Web & App Development");
      expect(msg).toContain("HTML & CSS (Module 1)");
      expect(msg).toContain("ali.khan@example.com");
      expect(msg).toContain("APPROVED");
    });

    it("passes zero-link assertion for standard template", () => {
      const msg = formatApprovalWhatsAppMessage({
        studentName: "Fatima Noor",
        courseTitle: "Artificial Intelligence",
        moduleName: "Module 1",
        email: "fatima@gmail.com",
      });

      expect(() => assertZeroLinks(msg)).not.toThrow();
    });

    it("detects and throws if any URL is present in the message", () => {
      expect(() => assertZeroLinks("Please visit https://emergingedge.tech to login")).toThrow(
        /WhatsApp policy violation/
      );
      expect(() => assertZeroLinks("Go to http://localhost:3000")).toThrow(
        /WhatsApp policy violation/
      );
      expect(() => assertZeroLinks("Check portal at www.mysite.com")).toThrow(
        /WhatsApp policy violation/
      );
    });
  });
});
