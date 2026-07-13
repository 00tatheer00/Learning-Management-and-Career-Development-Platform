import { describe, expect, it } from "vitest";
import {
  buildApprovalTemplatePreview,
  buildRejectionTemplatePreview,
  buildStudentLoginWhatsAppMessage,
} from "@/lib/notifications/approval-templates";
import { META_TEMPLATE_SUBMISSIONS } from "@/lib/whatsapp/cloud-api/templates";

describe("approval WhatsApp templates", () => {
  it("builds approval preview matching Facebook-approved template", () => {
    const preview = buildApprovalTemplatePreview({
      firstName: "Ahmed",
      courseName: "Web Development",
      module: "Beginner",
    });

    expect(preview).toContain("Ahmed");
    expect(preview).toContain("registered email");
    expect(preview).toContain("Welcome to your batch!");
    expect(preview).not.toContain("Password:");
  });

  it("builds rejection preview with reason", () => {
    const preview = buildRejectionTemplatePreview({
      fullName: "Sara Khan",
      courseName: "Web Development",
      reason: "Payment not verified",
    });

    expect(preview).toContain("Sara Khan");
    expect(preview).toContain("Payment not verified");
  });

  it("keeps login message for manual inbox send only", () => {
    const login = buildStudentLoginWhatsAppMessage({
      studentName: "Ahmed Ali",
      email: "ahmed@example.com",
      password: "secret123",
      courseName: "Web Development",
      module: "Beginner",
      level: "Level 1",
      loginUrl: "https://school.emergingedge.tech/login",
    });

    expect(login).toContain("secret123");
    expect(login).toContain("ahmed@example.com");
  });

  it("documents Meta template bodies — approval has 3 vars, rejection has 4", () => {
    expect(META_TEMPLATE_SUBMISSIONS.eest_registration_approved.body).not.toMatch(/\{\{4\}\}/);
    expect(META_TEMPLATE_SUBMISSIONS.eest_registration_rejected.body).toMatch(/\{\{4\}\}/);
  });
});
