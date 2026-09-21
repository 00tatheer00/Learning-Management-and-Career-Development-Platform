import { describe, expect, it, vi } from "vitest";
import { getAdminDashboardData } from "./admin-dashboard";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assignment: { count: vi.fn().mockResolvedValue(5) },
    liveSession: { findMany: vi.fn().mockResolvedValue([{ date: "2099-01-01" }]) },
    user: { count: vi.fn().mockResolvedValue(10) },
    enrollment: { count: vi.fn().mockResolvedValue(20) },
  },
}));

vi.mock("@/lib/api/admin-program-stats", () => ({
  getAdminProgramStats: vi.fn().mockResolvedValue({
    totalStudents: 100,
    trainerAssignedStudents: 90,
    missingTrainerAssignments: 10,
    webStudents: 60,
    appStudents: 40,
  }),
}));

vi.mock("@/lib/services/phase-service", () => ({
  getAllPhaseMetrics: vi.fn().mockResolvedValue({
    all: {
      totalEnrollments: 200,
      approvedEnrollments: 150,
      pendingEnrollments: 30,
      rejectedEnrollments: 20,
      students: 150,
      firstTimeRegistrations: 120,
      returningRegistrations: 30,
      estimatedRevenue: 450000,
      loggedInStudents: 140,
      neverLoggedInStudents: 10,
      webStudents: 90,
      appStudents: 60,
    },
    phase1: { totalEnrollments: 50, approvedEnrollments: 40, pendingEnrollments: 5, rejectedEnrollments: 5, estimatedRevenue: 100000 },
    phase2: { totalEnrollments: 50, approvedEnrollments: 40, pendingEnrollments: 5, rejectedEnrollments: 5, estimatedRevenue: 100000 },
    phase3: { totalEnrollments: 50, approvedEnrollments: 35, pendingEnrollments: 10, rejectedEnrollments: 5, estimatedRevenue: 125000 },
  }),
}));

describe("AdminDashboard — Domain Partitioning Verification", () => {
  it("returns structurally partitioned admissions and academic domain statistics", async () => {
    const data = await getAdminDashboardData();
    expect(data.admissions).toBeDefined();
    expect(data.academic).toBeDefined();

    // Admissions Domain
    expect(typeof data.admissions.totalEnrollments).toBe("number");
    expect(typeof data.admissions.approvedEnrollments).toBe("number");
    expect(typeof data.admissions.pendingEnrollments).toBe("number");
    expect(typeof data.admissions.rejectedEnrollments).toBe("number");
    expect(typeof data.admissions.estimatedRevenue).toBe("number");

    // Academic Domain
    expect(typeof data.academic.activeStudents).toBe("number");
    expect(typeof data.academic.trainerAssignedStudents).toBe("number");
    expect(typeof data.academic.assignments).toBe("number");
    expect(typeof data.academic.upcomingSessions).toBe("number");
    expect(typeof data.academic.trainers).toBe("number");
  });
});

