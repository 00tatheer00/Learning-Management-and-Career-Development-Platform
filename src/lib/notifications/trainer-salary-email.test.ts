import { describe, it, expect } from "vitest";
import {
  buildTrainerSalaryEmailHtml,
  buildTrainerSalaryEmailText,
} from "./trainer-salary-email";

describe("Trainer Salary Email Templates", () => {
  const sampleInput = {
    to: "tatheer@example.com",
    trainerName: "S Tatheer Hussain",
    courseTitle: "Web Development",
    phaseLabel: "Phase 3",
    periodLabel: "All time",
    studentCount: 45,
    amount: 31500,
    paidBy: "Tatheer",
    paymentAccount: "Meezan Bank",
    recipientAccount: "PK36MEZN000123456789",
    transactionRef: "TRX-9823412",
    paidAt: new Date("2026-09-21T14:30:00Z"),
    note: "Batch 3 remuneration disbursement",
  };

  it("builds correct HTML template with all details and amounts", () => {
    const html = buildTrainerSalaryEmailHtml(sampleInput);
    expect(html).toContain("S Tatheer Hussain");
    expect(html).toContain("Web Development");
    expect(html).toContain("Phase 3");
    expect(html).toContain("PKR 31,500");
    expect(html).toContain("Meezan Bank");
    expect(html).toContain("PK36MEZN000123456789");
    expect(html).toContain("TRX-9823412");
    expect(html).toContain("Batch 3 remuneration disbursement");
  });

  it("builds correct plain text fallback with details", () => {
    const text = buildTrainerSalaryEmailText(sampleInput);
    expect(text).toContain("Dear S Tatheer Hussain");
    expect(text).toContain("PKR 31,500");
    expect(text).toContain("Meezan Bank");
    expect(text).toContain("TRX-9823412");
  });

  it("handles optional fields gracefully when missing", () => {
    const minimalInput = {
      to: "faiza@example.com",
      trainerName: "Faiza Ghaffar",
      courseTitle: "Artificial Intelligence",
      phaseLabel: "Phase 3",
      periodLabel: "All time",
      studentCount: 20,
      amount: 14000,
      paidBy: "Management",
      paidAt: new Date("2026-09-21T14:30:00Z"),
    };

    const html = buildTrainerSalaryEmailHtml(minimalInput);
    expect(html).toContain("Faiza Ghaffar");
    expect(html).toContain("PKR 14,000");

    const text = buildTrainerSalaryEmailText(minimalInput);
    expect(text).toContain("Faiza Ghaffar");
    expect(text).toContain("PKR 14,000");
  });
});
