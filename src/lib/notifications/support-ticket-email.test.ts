import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  buildSupportTicketReplyEmailHtml,
  buildSupportTicketReplyEmailText,
  sendSupportTicketReplyEmail,
} from "@/lib/notifications/support-ticket-email";
import { Resend } from "resend";

vi.mock("resend", () => {
  const sendFn = vi.fn();
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: sendFn,
      },
    })),
  };
});

describe("support-ticket-email service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: "re_test_12345",
      EMAIL_FROM: "EEST Support <support@emergingedge.tech>",
    };
  });

  it("builds correct HTML template with ticket details and admin reply", () => {
    const html = buildSupportTicketReplyEmailHtml({
      to: "student@example.com",
      studentName: "Ali Ahmed",
      ticketNumber: "TKT-0042",
      subject: "Access to Figma resources",
      category: "module",
      status: "resolved",
      adminReply: "Your access has been granted to the Figma workspace.",
      isGuest: false,
    });

    expect(html).toContain("TKT-0042");
    expect(html).toContain("Ali Ahmed");
    expect(html).toContain("Access to Figma resources");
    expect(html).toContain("Your access has been granted to the Figma workspace.");
    expect(html).toContain("Resolved");
    expect(html).toContain("/student/support");
  });

  it("builds correct plain text version for guests", () => {
    const text = buildSupportTicketReplyEmailText({
      to: "guest@example.com",
      studentName: "Fatima Noor",
      ticketNumber: "TKT-0088",
      subject: "Course inquiry",
      category: "other",
      status: "open",
      adminReply: "We have noted your interest and will call you.",
      isGuest: true,
    });

    expect(text).toContain("Fatima Noor");
    expect(text).toContain("TKT-0088");
    expect(text).toContain("We have noted your interest and will call you.");
    expect(text).toContain("/support");
  });

  it("sends email successfully via Resend API", async () => {
    const resendInstance = new Resend("re_test_12345");
    (resendInstance.emails.send as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { id: "msg_abc123" },
      error: null,
    });

    const result = await sendSupportTicketReplyEmail({
      to: "student@example.com",
      studentName: "Ali Ahmed",
      ticketNumber: "TKT-0042",
      subject: "Payment verification query",
      category: "payment",
      status: "resolved",
      adminReply: "Receipt verified, thank you!",
    });

    expect(result.sent).toBe(true);
  });
});
