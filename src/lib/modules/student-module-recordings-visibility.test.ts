import { describe, expect, it } from "vitest";
import {
  canStudentAccessModuleContent,
  filterByStudentModule,
  isAllModulesLevel,
} from "@/lib/modules/student-module-content";
import { resolveCanonicalModule } from "@/lib/modules/student-module-access";

describe("Student Module Recordings Visibility & Canonical Matching", () => {
  it("detects all-modules access strings correctly", () => {
    expect(isAllModulesLevel("all")).toBe(true);
    expect(isAllModulesLevel("All")).toBe(true);
    expect(isAllModulesLevel("All Modules")).toBe(true);
    expect(isAllModulesLevel("all-modules")).toBe(true);
    expect(isAllModulesLevel("complete")).toBe(true);
    expect(isAllModulesLevel("Complete Course")).toBe(true);
    expect(isAllModulesLevel("Full Course")).toBe(true);
    expect(isAllModulesLevel("fullstack")).toBe(true);
    expect(isAllModulesLevel("HTML & CSS")).toBe(false);
    expect(isAllModulesLevel("JavaScript")).toBe(false);
    expect(isAllModulesLevel(null)).toBe(false);
  });

  it("grants access to all module recordings for student enrolled in all modules", () => {
    const student = {
      programSlug: "web-development",
      studentLevel: "All Modules",
      approvedLevels: ["All Modules"],
      email: "allstudent@example.com",
    };

    expect(
      canStudentAccessModuleContent(student.programSlug, student.studentLevel, "HTML & CSS", {
        email: student.email,
        approvedLevels: student.approvedLevels,
      })
    ).toBe(true);

    expect(
      canStudentAccessModuleContent(student.programSlug, student.studentLevel, "JavaScript", {
        email: student.email,
        approvedLevels: student.approvedLevels,
      })
    ).toBe(true);

    expect(
      canStudentAccessModuleContent(student.programSlug, student.studentLevel, "React", {
        email: student.email,
        approvedLevels: student.approvedLevels,
      })
    ).toBe(true);

    expect(
      canStudentAccessModuleContent(student.programSlug, student.studentLevel, "Backend + Database", {
        email: student.email,
        approvedLevels: student.approvedLevels,
      })
    ).toBe(true);
  });

  it("matches module names canonically between 'Module 1' and 'HTML & CSS'", () => {
    const student = {
      programSlug: "web-development",
      studentLevel: "Module 1",
      approvedLevels: ["Module 1"],
      email: "studentmod1@example.com",
    };

    // Recording uploaded by trainer with canonical title "HTML & CSS"
    expect(
      canStudentAccessModuleContent(student.programSlug, student.studentLevel, "HTML & CSS", {
        email: student.email,
        approvedLevels: student.approvedLevels,
      })
    ).toBe(true);

    // Recording tagged "Module 1"
    expect(
      canStudentAccessModuleContent(student.programSlug, student.studentLevel, "Module 1", {
        email: student.email,
        approvedLevels: student.approvedLevels,
      })
    ).toBe(true);

    // Recording tagged "html & css" (lowercase)
    expect(
      canStudentAccessModuleContent(student.programSlug, student.studentLevel, "html & css", {
        email: student.email,
        approvedLevels: student.approvedLevels,
      })
    ).toBe(true);

    // Blocked from Module 2 (JavaScript)
    expect(
      canStudentAccessModuleContent(student.programSlug, student.studentLevel, "JavaScript", {
        email: student.email,
        approvedLevels: student.approvedLevels,
      })
    ).toBe(false);
  });

  it("filters recordings list correctly across different modules and programs", () => {
    const recordings = [
      { id: "1", title: "HTML Basics", level: "HTML & CSS", programSlug: "web-development" },
      { id: "2", title: "CSS Grid", level: "Module 1", programSlug: "web-development" },
      { id: "3", title: "JS Syntax", level: "JavaScript", programSlug: "web-development" },
      { id: "4", title: "React Components", level: "React", programSlug: "web-development" },
      { id: "5", title: "AI Basics", level: "Module 1: AI Launchpad", programSlug: "artificial-intelligence" },
    ];

    // Web Dev student approved for Module 1 and Module 2
    const contextWebDev = {
      programSlug: "web-development",
      studentLevel: "JavaScript",
      approvedLevels: ["HTML & CSS", "JavaScript"],
      email: "webdev@example.com",
    };

    const visibleWeb = filterByStudentModule(
      recordings,
      contextWebDev,
      (r) => r.level,
      (r) => r.programSlug
    );

    expect(visibleWeb.map((r) => r.id)).toEqual(["1", "2", "3"]);
    expect(visibleWeb.some((r) => r.id === "4")).toBe(false); // React locked
    expect(visibleWeb.some((r) => r.id === "5")).toBe(false); // AI locked
  });

  it("canonical resolution handles AI, Flutter, and Marketing modules accurately", () => {
    expect(resolveCanonicalModule("artificial-intelligence", "Module 1")).toBe(
      "Module 1: AI Launchpad"
    );
    expect(resolveCanonicalModule("artificial-intelligence", "Module 2")).toBe(
      "Module 2: Data to ML Engineer"
    );
    expect(resolveCanonicalModule("app-development", "Module 2")).toBe("Flutter Frontend");
    expect(resolveCanonicalModule("digital-marketing", "seo")).toBe(
      "SEO (Search Engine Optimization)"
    );
  });
});
