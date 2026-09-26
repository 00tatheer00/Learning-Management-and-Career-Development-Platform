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
import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";
import { prisma } from "@/lib/prisma";

describe("ModuleEnrollmentService - Backward Compatible Multi-Module Tracking", () => {
  it("gracefully returns fallback enrollment levels when ModuleEnrollment collection is unpopulated", async () => {
    const result = await getStudentModuleEnrollments("nonexistent-test-user@example.com", "web-development");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("strictly returns only enrolled module (e.g. React) and does NOT auto-grant Module 1 (HTML & CSS)", async () => {
    vi.mocked(prisma.enrollment.findMany).mockResolvedValueOnce([
      { program: "web-development", level: "React", email: "umair@example.com" },
    ] as unknown as Awaited<ReturnType<typeof prisma.enrollment.findMany>>);

    vi.mocked(prisma.moduleEnrollment.findMany).mockResolvedValueOnce([
      { programSlug: "web-development", moduleName: "React", email: "umair@example.com" },
    ] as unknown as Awaited<ReturnType<typeof prisma.moduleEnrollment.findMany>>);

    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
      programSlug: "web-development",
      level: "React",
    } as unknown as Awaited<ReturnType<typeof prisma.user.findFirst>>);

    const approved = await getApprovedEnrollmentLevels("umair@example.com", "web-development");
    expect(approved).toEqual(["React"]);
    expect(approved).not.toContain("HTML & CSS");
    expect(approved).not.toContain("JavaScript");
  });

  it("fetchMergedByProgram invokes fetcher with only programSlug, avoiding index argument leaks", async () => {
    const { fetchMergedByProgram } = await import("@/lib/student-portal/program-scope");
    const mockFetcher = vi.fn().mockImplementation(async (slug: string, ...extraArgs: any[]) => {
      expect(extraArgs.length).toBe(0);
      return [`item-${slug}`];
    });

    const res = await fetchMergedByProgram(["web-development", "app-development"], mockFetcher);
    expect(res).toEqual(["item-web-development", "item-app-development"]);
    expect(mockFetcher).toHaveBeenCalledTimes(2);
    expect(mockFetcher).toHaveBeenNthCalledWith(1, "web-development");
    expect(mockFetcher).toHaveBeenNthCalledWith(2, "app-development");
  });
});

