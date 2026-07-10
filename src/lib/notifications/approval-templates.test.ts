import { describe, expect, it } from "vitest";
import {
  buildApprovalTemplatePreview,
  buildRejectionTemplatePreview,
  buildStudentLoginWhatsAppMessage,
} from "@/lib/notifications/approval-templates";
import { META_TEMPLATE_SUBMISSIONS } from "@/lib/whatsapp/cloud-api/templates";

describe("approval WhatsApp templates", () => {
  it("builds approval preview without password or portal link", () => {
    const preview = buildApprovalTemplatePreview({
      firstName: "Ahmed",
      courseName: "Web Development",
      module: "Beginner",
    });

    expect(preview).toContain("Ahmed");
    expect(preview).toContain("Portal login");
    expect(preview).not.toContain("Password:");
    expect(preview).not.toMatch(/https?:\/\//);
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

  it("documents Meta template bodies with four body variables each", () => {
    expect(META_TEMPLATE_SUBMISSIONS.eest_registration_approved.body).toMatch(/\{\{4\}\}/);
    expect(META_TEMPLATE_SUBMISSIONS.eest_registration_rejected.body).toMatch(/\{\{4\}\}/);
  });
});
