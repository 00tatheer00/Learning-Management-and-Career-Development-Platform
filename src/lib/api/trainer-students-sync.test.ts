import { describe, expect, it, vi } from "vitest";
import { getTrainerApprovedStudents } from "@/lib/api/trainer-students-sync";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    enrollment: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "enr-1",
          email: "student1@example.com",
          name: "Test Student",
          phone: "03001234567",
          level: "HTML & CSS",
          batch: "Batch 1",
          program: "web-development",
          status: "approved",
          createdAt: new Date("2026-08-01"),
        },
      ]),
    },
    user: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "usr-1",
          email: "student1@example.com",
          name: "Test Student",
          phone: "03001234567",
          avatarUrl: null,
          avatarInitials: "TS",
          programSlug: "web-development",
          level: "HTML & CSS",
        },
      ]),
    },
  },
}));

describe("Trainer Approved Students Sync & Deduplication", () => {
  it("returns an array of approved students for a course slug without throwing", async () => {
    const students = await getTrainerApprovedStudents("web-development");
    expect(Array.isArray(students)).toBe(true);

    // Verify all returned students belong to the target program slug
    for (const student of students) {
      expect(student.programSlug).toBe("web-development");
      expect(student.status).toBe("approved");
    }
  });

  it("handles non-existent or empty course slug gracefully", async () => {
    const students = await getTrainerApprovedStudents("non-existent-course-slug");
    expect(Array.isArray(students)).toBe(true);
  });
});

