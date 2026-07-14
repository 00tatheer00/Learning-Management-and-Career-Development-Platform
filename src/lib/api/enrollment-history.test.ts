import { describe, expect, it } from "vitest";
import {
  applicantMatches,
  mapApplicationSummaries,
} from "@/lib/api/enrollment-history";

describe("applicantMatches", () => {
  it("matches on normalized email", () => {
    expect(
      applicantMatches(
        { email: "Ali@Example.com", cnic: "1111111111111" },
        { email: "ali@example.com", cnic: "2222222222222" }
      )
    ).toBe(true);
  });

  it("matches on normalized cnic", () => {
    expect(
      applicantMatches(
        { email: "a@b.com", cnic: "35202-1234567-1" },
        { email: "x@y.com", cnic: "3520212345671" }
      )
    ).toBe(true);
  });
});

describe("mapApplicationSummaries", () => {
  const records = [
    {
      id: "enr-1",
      program: "web-development",
      level: "HTML & CSS",
      status: "approved" as const,
      createdAt: new Date("2026-07-01T10:00:00.000Z"),
      paymentScreenshot: "https://res.cloudinary.com/demo/payment.jpg",
    },
  ];

  it("omits payment screenshots from public summaries by default", () => {
    const summaries = mapApplicationSummaries(records);
    expect((summaries[0] as unknown as Record<string, unknown>)?.paymentScreenshot).toBeUndefined();
  });

  it("includes payment screenshots only when explicitly allowed", () => {
    const summaries = mapApplicationSummaries(records, { includePaymentScreenshots: true });
    expect((summaries[0] as unknown as Record<string, unknown>)?.paymentScreenshot).toContain("cloudinary.com");
  });
});
