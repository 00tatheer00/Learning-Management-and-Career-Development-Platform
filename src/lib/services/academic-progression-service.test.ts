import { describe, expect, it } from "vitest";
import { getStudentAcademicOverview, getModuleAcademicStats } from "./academic-progression-service";

describe("AcademicProgressionService - Independent Academic Progression Domain", () => {
  it("queries student academic overview independently of admissions data", async () => {
    const overview = await getStudentAcademicOverview("nonexistent-student-id");
    expect(overview).toBeNull();
  });

  it("queries module academic stats independently", async () => {
    const stats = await getModuleAcademicStats("web-development", "HTML & CSS");
    expect(stats.programSlug).toBe("web-development");
    expect(stats.moduleName).toBe("HTML & CSS");
    expect(typeof stats.totalEnrolledStudents).toBe("number");
    expect(typeof stats.activeStudents).toBe("number");
    expect(typeof stats.completedStudents).toBe("number");
  });
});
