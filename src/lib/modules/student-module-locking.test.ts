import { describe, expect, it } from "vitest";
import { resolveActiveStudentModule } from "@/lib/modules/student-module-access";

describe("Student Module Locking & Approved Switcher Verification", () => {
  it("keeps future modules locked if student has only approved Module 1", () => {
    const programSlug = "web-development";
    const approvedLevels = ["HTML & CSS"];

    // Active module resolves to HTML & CSS
    const active = resolveActiveStudentModule(programSlug, "HTML & CSS", approvedLevels);
    expect(active).toBe("HTML & CSS");

    // Student cannot access unapproved Module 2 (JavaScript)
    const activeIfAttempted = resolveActiveStudentModule(programSlug, "JavaScript", approvedLevels);
    expect(activeIfAttempted).toBe("HTML & CSS");
  });

  it("allows switching only between approved modules and blocks unapproved modules", () => {
    const programSlug = "web-development";
    const approvedLevels = ["HTML & CSS", "JavaScript"];

    // Student can switch to Module 2 (JavaScript) because it is approved
    const activeMod2 = resolveActiveStudentModule(programSlug, "JavaScript", approvedLevels);
    expect(activeMod2).toBe("JavaScript");

    // Student cannot access unapproved Module 3 (React & Native) — resolves to first approved module
    const activeMod3 = resolveActiveStudentModule(programSlug, "React & Native", approvedLevels);
    expect(approvedLevels.includes(activeMod3 ?? "")).toBe(true);
    expect(activeMod3).not.toBe("React & Native");
  });
});
