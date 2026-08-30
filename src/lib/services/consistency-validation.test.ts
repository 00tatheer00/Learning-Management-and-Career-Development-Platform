import { describe, expect, it } from "vitest";
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

    expect(getRegistrationPhase({ createdAt: phase1Date })).toBe("phase-1");
    expect(getRegistrationPhase({ createdAt: phase2Date })).toBe("phase-2");
    expect(getRegistrationPhase({ createdAt: phase3Date })).toBe("phase-3");
  });
});
