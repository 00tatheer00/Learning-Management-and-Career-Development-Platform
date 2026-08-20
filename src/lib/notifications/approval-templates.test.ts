import { describe, expect, it } from "vitest";
import {
  buildApprovalEmailHtml,
  buildApprovalEmailText,
} from "@/lib/notifications/approval-templates";

describe("approval email templates", () => {
  it("builds approval email HTML with credentials and student name", () => {
    const html = buildApprovalEmailHtml({
      studentName: "Ahmed Ali",
      email: "ahmed@example.com",
      password: "secretpassword123",
      courseName: "Web Development",
      level: "Level 1",
      loginUrl: "https://school.emergingedge.tech/login",
    });

    expect(html).toContain("Ahmed");
    expect(html).toContain("ahmed@example.com");
    expect(html).toContain("secretpassword123");
    expect(html).toContain("Web Development");
    expect(html).toContain("https://school.emergingedge.tech/login");
  });

  it("builds approval email plain text with credentials", () => {
    const text = buildApprovalEmailText({
      studentName: "Sara Khan",
      email: "sara@example.com",
      password: "mypassword456",
      courseName: "Artificial Intelligence",
      level: "Beginner",
      loginUrl: "https://school.emergingedge.tech/login",
    });

    expect(text).toContain("Sara");
    expect(text).toContain("sara@example.com");
    expect(text).toContain("mypassword456");
    expect(text).toContain("Artificial Intelligence");
  });
});
