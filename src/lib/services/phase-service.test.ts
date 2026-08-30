import { describe, expect, it } from "vitest";
import {
  getRegistrationPhase,
  PHASE_2_START_ISO,
  PHASE_3_START_ISO,
} from "@/lib/services/phase-service";

describe("PhaseService - Centralized Phase Classification", () => {
  it("classifies registration created before 24 July 2026 as phase-1", () => {
    const dateStr = "2026-07-20T10:00:00.000Z";
    expect(getRegistrationPhase(dateStr)).toBe("phase-1");
    expect(getRegistrationPhase(new Date(dateStr))).toBe("phase-1");
    expect(getRegistrationPhase({ createdAt: dateStr })).toBe("phase-1");
  });

  it("classifies registration created between 24 July and 28 August 2026 as phase-2", () => {
    const exactStart = PHASE_2_START_ISO;
    expect(getRegistrationPhase(exactStart)).toBe("phase-2");
    expect(getRegistrationPhase(new Date(exactStart))).toBe("phase-2");

    const afterStart = "2026-07-25T14:30:00.000Z";
    expect(getRegistrationPhase(afterStart)).toBe("phase-2");
    expect(getRegistrationPhase({ createdAt: afterStart })).toBe("phase-2");

    const justBeforePhase3 = "2026-08-28T18:59:59.999Z";
    expect(getRegistrationPhase(justBeforePhase3)).toBe("phase-2");
  });

  it("classifies registration created exactly at or after 29 August 2026 00:00 PKT (19:00 UTC August 28) as phase-3", () => {
    const exactStart = PHASE_3_START_ISO;
    expect(getRegistrationPhase(exactStart)).toBe("phase-3");
    expect(getRegistrationPhase(new Date(exactStart))).toBe("phase-3");

    const afterStart = "2026-08-29T10:00:00.000Z";
    expect(getRegistrationPhase(afterStart)).toBe("phase-3");
    expect(getRegistrationPhase({ createdAt: afterStart })).toBe("phase-3");
  });

  it("relies strictly on date regardless of extra properties", () => {
    // Even if level says JavaScript or React, if created before July 24, phase is phase-1
    const phase1Item = {
      createdAt: "2026-07-15T08:00:00.000Z",
      level: "JavaScript (Module 2)",
      batch: "Batch 2",
    };
    expect(getRegistrationPhase(phase1Item)).toBe("phase-1");

    // If created on August 30, phase is phase-3
    const phase3Item = {
      createdAt: "2026-08-30T08:00:00.000Z",
      level: "Module 1",
      batch: "Batch 1",
    };
    expect(getRegistrationPhase(phase3Item)).toBe("phase-3");
  });
});
