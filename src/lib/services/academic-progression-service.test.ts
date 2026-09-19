import { describe, expect, it, vi } from "vitest";
import { getStudentAcademicOverview, getModuleAcademicStats } from "./academic-progression-service";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockImplementation(async ({ where }) => {
        if (where.id === "nonexistent-student-id") return null;
        return {
          id: where.id,
          email: "student@example.com",
          name: "Test Student",
          programSlug: "web-development",
          level: "HTML & CSS",
        };
      }),
    },
    classAttendance: { count: vi.fn().mockResolvedValue(10) },
    assignmentSubmission: { findMany: vi.fn().mockResolvedValue([{ status: "approved" }]) },
    watchProgress: { count: vi.fn().mockResolvedValue(5) },
    moduleEnrollment: {
      findMany: vi.fn().mockResolvedValue([
        { status: "active" },
        { status: "completed" },
      ]),
    },
  },
}));

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

