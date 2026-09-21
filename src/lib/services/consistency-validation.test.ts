import { describe, expect, it, vi } from "vitest";

const { mockEnrollments, mockStudentUsers } = vi.hoisted(() => ({
  mockEnrollments: [
    {
      id: "e1",
      email: "p1@example.com",
      status: "approved",
      program: "web-development",
      createdAt: new Date("2026-07-20T10:00:00.000Z"),
    },
    {
      id: "e2",
      email: "p2@example.com",
      status: "pending",
      program: "app-development",
      createdAt: new Date("2026-08-01T10:00:00.000Z"),
    },
    {
      id: "e3",
      email: "p3@example.com",
      status: "rejected",
      program: "web-development",
      createdAt: new Date("2026-09-01T10:00:00.000Z"),
    },
    {
      id: "e4",
      email: "p4@example.com",
      status: "approved",
      program: "artificial-intelligence",
      createdAt: new Date("2026-09-19T10:00:00.000Z"),
    },
  ],
  mockStudentUsers: [
    {
      id: "u1",
      email: "p1@example.com",
      firstLoginAt: new Date("2026-07-21T10:00:00.000Z"),
      programSlug: "web-development",
    },
    {
      id: "u4",
      email: "p4@example.com",
      firstLoginAt: null,
      programSlug: "artificial-intelligence",
    },
  ],
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    enrollment: {
      findMany: vi.fn().mockResolvedValue(mockEnrollments),
    },
    user: {
      findMany: vi.fn().mockResolvedValue(mockStudentUsers),
    },
  },
}));

import { getCentralPhaseMetrics, getRegistrationPhase } from "@/lib/services/phase-service";


describe("Step 10 — System-Wide Mathematical Consistency Validation", () => {
  it("guarantees mathematical identity: Phase 1 + Phase 2 + Phase 3 === All for registrations", async () => {
    const [all, p1, p2, p3] = await Promise.all([
      getCentralPhaseMetrics("all"),
      getCentralPhaseMetrics("phase-1"),
      getCentralPhaseMetrics("phase-2"),
      getCentralPhaseMetrics("phase-3"),
    ]);

    expect(p1.totalEnrollments + p2.totalEnrollments + p3.totalEnrollments).toBe(all.totalEnrollments);
    expect(p1.approvedEnrollments + p2.approvedEnrollments + p3.approvedEnrollments).toBe(all.approvedEnrollments);
    expect(p1.pendingEnrollments + p2.pendingEnrollments + p3.pendingEnrollments).toBe(all.pendingEnrollments);
    expect(p1.rejectedEnrollments + p2.rejectedEnrollments + p3.rejectedEnrollments).toBe(all.rejectedEnrollments);
    expect(p1.estimatedRevenue + p2.estimatedRevenue + p3.estimatedRevenue).toBe(all.estimatedRevenue);
  });

  it("evaluates registration phase deterministically based on date threshold", () => {
    const phase1Date = new Date("2026-07-20T10:00:00.000Z");
    const phase2Date = new Date("2026-07-25T10:00:00.000Z");
    const phase3Date = new Date("2026-08-30T10:00:00.000Z");
    const futureDate = new Date("2026-09-20T10:00:00.000Z");

    expect(getRegistrationPhase({ createdAt: phase1Date })).toBe("phase-1");
    expect(getRegistrationPhase({ createdAt: phase2Date })).toBe("phase-2");
    expect(getRegistrationPhase({ createdAt: phase3Date })).toBe("phase-3");
    expect(getRegistrationPhase({ createdAt: futureDate })).toBe("phase-3");
  });
});

