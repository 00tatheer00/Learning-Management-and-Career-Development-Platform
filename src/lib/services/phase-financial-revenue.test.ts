import { describe, expect, it } from "vitest";
import { getRegistrationPhase } from "@/lib/services/phase-service";
import { getRevenueSplitForItem } from "@/lib/constants/revenue-split";

describe("Phase Financial Reporting — Advance Registration Exclusion", () => {
  it("Scenario 1: Phase 1 advance registration student approved in Phase 2 has ZERO revenue in Phase 2", () => {
    // Student registered on July 10 (Phase 1) for Module 1, 2, 3, 4
    const phase1CreatedAt = new Date("2026-07-10T10:00:00.000Z");
    const phase2ReviewedAt = new Date("2026-07-26T10:00:00.000Z");

    const registrationItem = {
      createdAt: phase1CreatedAt,
      reviewedAt: phase2ReviewedAt,
      level: "JavaScript (Module 2)",
      batch: "Batch 1 - Phase 2",
    };

    // Financial phase MUST strictly evaluate to Phase 1 based on createdAt
    const financialPhase = getRegistrationPhase(registrationItem.createdAt);
    expect(financialPhase).toBe("phase-1");

    // Revenue split for Phase 1 registration uses Phase 1 split rules
    const split = getRevenueSplitForItem(registrationItem);
    expect(split.trainer).toBe(800);
    expect(split.school).toBe(0);
  });

  it("Scenario 2: Brand new student registered after July 24 is calculated cleanly in Phase 2", () => {
    // Brand new student registered on July 25 (Phase 2)
    const phase2CreatedAt = new Date("2026-07-25T10:00:00.000Z");

    const registrationItem = {
      createdAt: phase2CreatedAt,
      level: "JavaScript (Module 2)",
      batch: "Batch 1",
    };

    const financialPhase = getRegistrationPhase(registrationItem.createdAt);
    expect(financialPhase).toBe("phase-2");

    const split = getRevenueSplitForItem(registrationItem);
    expect(split.gross).toBe(1000);
    expect(split.management).toBe(200);
    expect(split.trainer).toBe(700);
    expect(split.school).toBe(100);
  });
});
