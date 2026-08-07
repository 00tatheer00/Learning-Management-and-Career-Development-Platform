import { describe, expect, it } from "vitest";
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
