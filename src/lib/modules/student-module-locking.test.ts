import { describe, expect, it } from "vitest";
import { resolveActiveStudentModule } from "@/lib/modules/student-module-access";
import {
  canStudentAccessModuleContent,
  filterByStudentModule,
} from "@/lib/modules/student-module-content";

describe("Student Module Locking & Strict Per-Module Isolation", () => {
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

  describe("Strict Per-Module Content Locking (Phase 1, 2, and 3)", () => {
    it("guarantees Phase 1 student only accesses Phase 1 / Module 1 content", () => {
      const student = {
        programSlug: "web-development",
        studentLevel: "HTML & CSS",
        approvedLevels: ["HTML & CSS"],
        email: "student1@gmail.com",
      };

      // Can access Module 1
      expect(
        canStudentAccessModuleContent(
          student.programSlug,
          student.studentLevel,
          "HTML & CSS",
          { email: student.email, approvedLevels: student.approvedLevels }
        )
      ).toBe(true);

      // Blocked from Module 2 (JavaScript)
      expect(
        canStudentAccessModuleContent(
          student.programSlug,
          student.studentLevel,
          "JavaScript",
          { email: student.email, approvedLevels: student.approvedLevels }
        )
      ).toBe(false);

      // Blocked from Module 3 (React & Next.js)
      expect(
        canStudentAccessModuleContent(
          student.programSlug,
          student.studentLevel,
          "React & Next.js",
          { email: student.email, approvedLevels: student.approvedLevels }
        )
      ).toBe(false);
    });

    it("guarantees Phase 2 student only accesses Phase 2 / Module 2 content", () => {
      const student = {
        programSlug: "web-development",
        studentLevel: "JavaScript",
        approvedLevels: ["JavaScript"],
        email: "student2@gmail.com",
      };

      // Can access Module 2
      expect(
        canStudentAccessModuleContent(
          student.programSlug,
          student.studentLevel,
          "JavaScript",
          { email: student.email, approvedLevels: student.approvedLevels }
        )
      ).toBe(true);

      // Blocked from Module 1 (HTML & CSS)
      expect(
        canStudentAccessModuleContent(
          student.programSlug,
          student.studentLevel,
          "HTML & CSS",
          { email: student.email, approvedLevels: student.approvedLevels }
        )
      ).toBe(false);

      // Blocked from Module 3 (React & Next.js)
      expect(
        canStudentAccessModuleContent(
          student.programSlug,
          student.studentLevel,
          "React & Next.js",
          { email: student.email, approvedLevels: student.approvedLevels }
        )
      ).toBe(false);
    });

    it("guarantees Phase 3 student only accesses Phase 3 / Module 3 content", () => {
      const student = {
        programSlug: "web-development",
        studentLevel: "React & Native",
        approvedLevels: ["React & Native"],
        email: "student3@gmail.com",
      };

      // Can access Module 3
      expect(
        canStudentAccessModuleContent(
          student.programSlug,
          student.studentLevel,
          "React & Native",
          { email: student.email, approvedLevels: student.approvedLevels }
        )
      ).toBe(true);

      // Blocked from Module 1 (HTML & CSS)
      expect(
        canStudentAccessModuleContent(
          student.programSlug,
          student.studentLevel,
          "HTML & CSS",
          { email: student.email, approvedLevels: student.approvedLevels }
        )
      ).toBe(false);

      // Blocked from Module 2 (JavaScript)
      expect(
        canStudentAccessModuleContent(
          student.programSlug,
          student.studentLevel,
          "JavaScript",
          { email: student.email, approvedLevels: student.approvedLevels }
        )
      ).toBe(false);
    });

    it("filters materials and assignments strictly by enrolled module", () => {
      const items = [
        { id: "1", title: "HTML Basics Assignment", level: "HTML & CSS" },
        { id: "2", title: "JS Dom Manipulation", level: "JavaScript" },
        { id: "3", title: "React Hooks Project", level: "React & Native" },
      ];

      const phase1Student = {
        programSlug: "web-development",
        studentLevel: "HTML & CSS",
        approvedLevels: ["HTML & CSS"],
        email: "student1@gmail.com",
      };

      const phase3Student = {
        programSlug: "web-development",
        studentLevel: "React & Native",
        approvedLevels: ["React & Native"],
        email: "student3@gmail.com",
      };

      const phase1Visible = filterByStudentModule(items, phase1Student, (i) => i.level);
      expect(phase1Visible.map((i) => i.id)).toEqual(["1"]);

      const phase3Visible = filterByStudentModule(items, phase3Student, (i) => i.level);
      expect(phase3Visible.map((i) => i.id)).toEqual(["3"]);
    });

    it("filters class recordings strictly so students only receive their enrolled module recordings", () => {
      const allClassRecordings = [
        { id: "rec-1", classNumber: 1, title: "HTML Basics", level: "HTML & CSS", programSlug: "web-development" },
        { id: "rec-2", classNumber: 2, title: "CSS Flexbox", level: "HTML & CSS", programSlug: "web-development" },
        { id: "rec-3", classNumber: 1, title: "JavaScript Variables", level: "JavaScript", programSlug: "web-development" },
        { id: "rec-4", classNumber: 1, title: "React State", level: "React & Native", programSlug: "web-development" },
        { id: "rec-5", classNumber: 1, title: "Flutter Widgets", level: "Dart & Flutter", programSlug: "app-development" },
      ];

      // Student enrolled in Web Dev Module 1 only
      const webDevMod1Student = {
        programSlug: "web-development",
        studentLevel: "HTML & CSS",
        approvedLevels: ["HTML & CSS"],
        email: "webstudent@gmail.com",
      };

      const visibleForWebDev1 = filterByStudentModule(
        allClassRecordings,
        webDevMod1Student,
        (r) => r.level,
        (r) => r.programSlug
      );
      expect(visibleForWebDev1.map((r) => r.id)).toEqual(["rec-1", "rec-2"]);

      // Student enrolled in App Dev Flutter only
      const appDevStudent = {
        programSlug: "app-development",
        studentLevel: "Dart & Flutter",
        approvedLevels: ["Dart & Flutter"],
        email: "appstudent@gmail.com",
      };

      const visibleForAppDev = filterByStudentModule(
        allClassRecordings,
        appDevStudent,
        (r) => r.level,
        (r) => r.programSlug
      );
      expect(visibleForAppDev.map((r) => r.id)).toEqual(["rec-5"]);
    });
  });
});
