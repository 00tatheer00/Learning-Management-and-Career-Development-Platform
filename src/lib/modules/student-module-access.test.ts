import { describe, expect, it } from "vitest";
import {
  canAccessModuleOneClasses,
  getFirstModuleName,
  isFirstModuleStudent,
  resolveActiveStudentModule,
} from "@/lib/modules/student-module-access";

describe("student module access", () => {
  it("identifies web module 1", () => {
    expect(getFirstModuleName("web-development")).toBe("HTML & CSS");
  });

  it("allows only first module students to join live classes", () => {
    expect(isFirstModuleStudent("web-development", "HTML & CSS")).toBe(true);
    expect(isFirstModuleStudent("web-development", "JavaScript")).toBe(false);
    expect(canAccessModuleOneClasses("web-development", "React")).toBe(false);
    expect(canAccessModuleOneClasses("web-development", null)).toBe(false);
  });

  it("uses the earliest approved module when a student enrolled in multiple modules", () => {
    const approved = ["HTML & CSS", "JavaScript", "React", "Backend + Database"];

    expect(
      resolveActiveStudentModule("web-development", "Backend + Database", approved)
    ).toBe("HTML & CSS");

    expect(
      canAccessModuleOneClasses("web-development", "Backend + Database", approved)
    ).toBe(true);
  });

  it("does not grant module 1 access when only later modules are approved", () => {
    expect(
      canAccessModuleOneClasses("web-development", "Backend + Database", [
        "Backend + Database",
      ])
    ).toBe(false);
  });

  it("identifies app module 1", () => {
    expect(getFirstModuleName("app-development")).toBe("Dart & OOP");
    expect(isFirstModuleStudent("app-development", "Dart & OOP")).toBe(true);
    expect(isFirstModuleStudent("app-development", "Flutter Frontend")).toBe(false);
  });
});
