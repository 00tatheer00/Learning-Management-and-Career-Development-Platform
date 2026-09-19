import { describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    enrollment: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    moduleEnrollment: {
      upsert: vi.fn().mockResolvedValue({ id: "mod-1" }),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    enrollment: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    moduleEnrollment: {
      upsert: vi.fn().mockResolvedValue({ id: "mod-1" }),
    },
  },
}));

import { runModuleEnrollmentsBackfill } from "../../../scripts/backfill-module-enrollments";

describe("Safe Migration Script - backfillModuleEnrollments", () => {
  it("executes non-destructively and handles missing or zero records gracefully", async () => {
    const summary = await runModuleEnrollmentsBackfill();
    expect(summary).toBeDefined();
    expect(typeof summary.total).toBe("number");
    expect(typeof summary.processed).toBe("number");
    expect(typeof summary.createdOrUpdated).toBe("number");
  });
});

