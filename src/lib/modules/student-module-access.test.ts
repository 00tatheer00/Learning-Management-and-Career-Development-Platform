import { describe, expect, it } from "vitest";
import {
  canAccessModuleOneClasses,
  getFirstModuleName,
  isFirstModuleStudent,
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

  it("identifies app module 1", () => {
    expect(getFirstModuleName("app-development")).toBe("Dart & OOP");
    expect(isFirstModuleStudent("app-development", "Dart & OOP")).toBe(true);
    expect(isFirstModuleStudent("app-development", "Flutter Frontend")).toBe(false);
  });
});
