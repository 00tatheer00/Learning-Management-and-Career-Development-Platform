import { describe, expect, it } from "vitest";
import { getAdminDashboardData } from "./admin-dashboard";

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
