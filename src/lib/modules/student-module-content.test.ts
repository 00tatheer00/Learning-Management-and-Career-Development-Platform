import { describe, expect, it } from "vitest";
import {
  canStudentAccessModuleContent,
  filterByStudentModule,
  resolveContentModuleLevel,
} from "@/lib/modules/student-module-content";

describe("student module content", () => {
  it("defaults untagged content to the first module", () => {
    expect(resolveContentModuleLevel("web-development", null)).toBe("HTML & CSS");
    expect(resolveContentModuleLevel("web-development", undefined)).toBe("HTML & CSS");
  });

  it("allows only matching module content", () => {
    expect(
      canStudentAccessModuleContent("web-development", "HTML & CSS", "HTML & CSS")
    ).toBe(true);
    expect(canStudentAccessModuleContent("web-development", "JavaScript", "HTML & CSS")).toBe(
      false
    );
  });

  it("allows untagged content for any enrolled student", () => {
    // Content with null level = program-wide, accessible to all
    expect(
      canStudentAccessModuleContent("web-development", "JavaScript", null)
    ).toBe(true);
  });

  it("denies tagged content when student has no enrollment data", () => {
    // No approved levels and no active level → deny access to tagged content
    expect(
      canStudentAccessModuleContent("web-development", null, "HTML & CSS")
    ).toBe(false);
    expect(
      canStudentAccessModuleContent("web-development", null, "JavaScript", {
        approvedLevels: [],
      })
    ).toBe(false);
  });

  it("allows content via approved levels", () => {
    expect(
      canStudentAccessModuleContent("web-development", null, "JavaScript", {
        approvedLevels: ["JavaScript"],
      })
    ).toBe(true);
    // Deny when not in approved list
    expect(
      canStudentAccessModuleContent("web-development", null, "HTML & CSS", {
        approvedLevels: ["JavaScript"],
      })
    ).toBe(false);
  });

  it("filters lists by student module", () => {
    const items = [
      { id: "1", level: "HTML & CSS" },
      { id: "2", level: "JavaScript" },
      { id: "3", level: undefined },
    ];

    const filtered = filterByStudentModule(
      items,
      {
        programSlug: "web-development",
        programSlugs: ["web-development"],
        studentLevel: "JavaScript",
        approvedLevels: ["JavaScript"],
        approvedLevelsByProgram: { "web-development": ["JavaScript"] },
      },
      (item) => item.level
    );

    // item 2 (JavaScript) matches + item 3 (no level = program-wide) passes
    expect(filtered.map((item) => item.id)).toEqual(["2", "3"]);
  });
});
