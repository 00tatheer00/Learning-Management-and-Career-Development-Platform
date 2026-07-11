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
    expect(
      canStudentAccessModuleContent("web-development", "JavaScript", null)
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
        studentLevel: "JavaScript",
        approvedLevels: ["JavaScript"],
      },
      (item) => item.level
    );

    expect(filtered.map((item) => item.id)).toEqual(["2"]);
  });
});
