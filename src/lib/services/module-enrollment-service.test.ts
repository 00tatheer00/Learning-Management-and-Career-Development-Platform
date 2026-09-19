import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    moduleEnrollment: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    enrollment: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
}));

import { getStudentModuleEnrollments } from "@/lib/services/module-enrollment-service";

describe("ModuleEnrollmentService - Backward Compatible Multi-Module Tracking", () => {
  it("gracefully returns fallback enrollment levels when ModuleEnrollment collection is unpopulated", async () => {
    const result = await getStudentModuleEnrollments("nonexistent-test-user@example.com", "web-development");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

