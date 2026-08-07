import { describe, expect, it } from "vitest";
import { getStudentModuleEnrollments } from "@/lib/services/module-enrollment-service";

describe("ModuleEnrollmentService - Backward Compatible Multi-Module Tracking", () => {
  it("gracefully returns fallback enrollment levels when ModuleEnrollment collection is unpopulated", async () => {
    const result = await getStudentModuleEnrollments("nonexistent-test-user@example.com", "web-development");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
