import { afterEach, describe, expect, it } from "vitest";
import { getEmailFromAddress } from "@/lib/notifications/email-config";

describe("getEmailFromAddress", () => {
  const original = process.env.EMAIL_FROM;

  afterEach(() => {
    if (original === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = original;
  });

  it("normalizes quoted and loose formats", () => {
    process.env.EMAIL_FROM = '"EEST <noreply@emergingedge.tech>"';
    expect(getEmailFromAddress()).toBe("EEST <noreply@emergingedge.tech>");

    process.env.EMAIL_FROM = "EEST noreply@emergingedge.tech";
    expect(getEmailFromAddress()).toBe("EEST <noreply@emergingedge.tech>");

    process.env.EMAIL_FROM = "noreply@emergingedge.tech";
    expect(getEmailFromAddress()).toBe("noreply@emergingedge.tech");
  });

  it("falls back to default when env is invalid", () => {
    process.env.EMAIL_FROM = "not-an-email";
    expect(getEmailFromAddress()).toBe("EEST <noreply@emergingedge.tech>");
  });
});
