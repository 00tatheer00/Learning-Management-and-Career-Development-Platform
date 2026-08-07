import { describe, expect, it } from "vitest";
import { getTrainerApprovedStudents } from "@/lib/api/trainer-students-sync";

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
