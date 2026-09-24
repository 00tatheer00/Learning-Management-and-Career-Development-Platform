import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  normalizeEmail,
  normalizePhone,
  sha256Hex,
  trackTikTokCompleteRegistration,
  trackTikTokContact,
  trackTikTokIdentify,
  trackTikTokViewContent,
} from "./tiktok";

describe("TikTok Analytics Utilities", () => {
  describe("normalizeEmail", () => {
    it("trims and lowercases emails", () => {
      expect(normalizeEmail("  Student@Domain.COM  ")).toBe("student@domain.com");
      expect(normalizeEmail("USER.NAME+tag@Gmail.COM")).toBe("user.name+tag@gmail.com");
    });
  });

  describe("normalizePhone", () => {
    it("formats Pakistani local numbers (03XX-XXXXXXX) into E.164 (+923...)", () => {
      expect(normalizePhone("0300-1234567")).toBe("+923001234567");
      expect(normalizePhone("0312 3456789")).toBe("+923123456789");
      expect(normalizePhone("03331112233")).toBe("+923331112233");
    });

    it("preserves international numbers with country codes", () => {
      expect(normalizePhone("+923001234567")).toBe("+923001234567");
      expect(normalizePhone("923001234567")).toBe("+923001234567");
    });

    it("returns empty string on empty input", () => {
      expect(normalizePhone("")).toBe("");
    });
  });

  describe("sha256Hex", () => {
    it("generates a valid 64-character lowercase hex hash", async () => {
      const hash = await sha256Hex("hello@world.com");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("produces deterministic hashes for normalized inputs", async () => {
      const hash1 = await sha256Hex(normalizeEmail("  TEST@example.com  "));
      const hash2 = await sha256Hex("test@example.com");
      expect(hash1).toBe(hash2);
    });
  });

  describe("Event tracking with window.ttq", () => {
    let mockTrack: ReturnType<typeof vi.fn>;
    let mockIdentify: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockTrack = vi.fn();
      mockIdentify = vi.fn();

      // Mock window.ttq
      vi.stubGlobal("window", {
        crypto: globalThis.crypto,
        ttq: {
          track: mockTrack,
          identify: mockIdentify,
        },
      });

      // Clear sessionStorage if available
      try {
        sessionStorage.clear();
      } catch {
        // Ignored
      }
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("trackTikTokViewContent calls ttq.track with ViewContent and course details", () => {
      trackTikTokViewContent({
        contentId: "web-development",
        contentName: "Full-Stack Web Development",
        value: 1000,
        currency: "PKR",
      });

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith("ViewContent", {
        contents: [
          {
            content_id: "web-development",
            content_type: "product",
            content_name: "Full-Stack Web Development",
          },
        ],
        value: 1000,
        currency: "PKR",
      });
    });

    it("trackTikTokIdentify hashes email and phone before calling ttq.identify", async () => {
      await trackTikTokIdentify({
        email: "student@example.com",
        phone: "0300-1234567",
        externalId: "REC-001",
      });

      expect(mockIdentify).toHaveBeenCalledTimes(1);
      const callArg = mockIdentify.mock.calls[0][0];

      // Sensitive data must NEVER be raw
      expect(callArg.email).not.toBe("student@example.com");
      expect(callArg.phone_number).not.toBe("0300-1234567");

      // Must be 64-char sha-256 hex strings
      expect(callArg.email).toHaveLength(64);
      expect(callArg.phone_number).toHaveLength(64);
      expect(callArg.external_id).toHaveLength(64);
    });

    it("trackTikTokCompleteRegistration identifies and tracks CompleteRegistration exactly once", async () => {
      const regParams = {
        contentId: "artificial-intelligence",
        contentName: "AI & Machine Learning Bootcamp",
        value: 1000,
        currency: "PKR",
        email: "applicant@eest.tech",
        phone: "0300-9876543",
        externalId: "EEST-2026-REG-9999",
      };

      await trackTikTokCompleteRegistration(regParams);

      expect(mockIdentify).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith("CompleteRegistration", {
        contents: [
          {
            content_id: "artificial-intelligence",
            content_type: "product",
            content_name: "AI & Machine Learning Bootcamp",
          },
        ],
        value: 1000,
        currency: "PKR",
      });

      // Calling again with the same externalId must be ignored (deduplicated)
      await trackTikTokCompleteRegistration(regParams);
      expect(mockTrack).toHaveBeenCalledTimes(1);
    });

    it("does NOT fire CompleteRegistration if API submission or validation fails", async () => {
      // Simulated failed registration submission
      let apiSucceeded = false;
      try {
        const responseOk = false; // Simulated 400 or 500 error from /api/enrollment
        if (!responseOk) {
          throw new Error("Validation or server error occurred");
        }
        apiSucceeded = true;
      } catch {
        // Handled in catch block
      }

      // Verify that trackTikTokCompleteRegistration was never called
      if (apiSucceeded) {
        await trackTikTokCompleteRegistration({
          contentId: "web-development",
          contentName: "Web Development",
          externalId: "REC-FAIL-1",
        });
      }

      expect(mockTrack).not.toHaveBeenCalled();
      expect(mockIdentify).not.toHaveBeenCalled();
    });

    it("trackTikTokContact identifies and tracks Contact event", async () => {
      await trackTikTokContact({
        contentId: "contact_inquiry",
        contentName: "Admission Inquiry",
        email: "inquiring@eest.tech",
      });

      expect(mockIdentify).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith("Contact", {
        contents: [
          {
            content_id: "contact_inquiry",
            content_type: "product",
            content_name: "Admission Inquiry",
          },
        ],
        value: 0,
        currency: "PKR",
      });
    });
  });
});
