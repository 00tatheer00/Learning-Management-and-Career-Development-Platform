import { describe, expect, it } from "vitest";
import {
  getRegistrationPhase,
  PHASE_2_START_ISO,
  PHASE_3_START_ISO,
  PHASE_4_START_ISO,
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

  it("classifies registration created between 29 August and 18 September 2026 as phase-3", () => {
    const exactStart = PHASE_3_START_ISO;
    expect(getRegistrationPhase(exactStart)).toBe("phase-3");
    expect(getRegistrationPhase(new Date(exactStart))).toBe("phase-3");

    const afterStart = "2026-08-29T10:00:00.000Z";
    expect(getRegistrationPhase(afterStart)).toBe("phase-3");
    expect(getRegistrationPhase({ createdAt: afterStart })).toBe("phase-3");

    const justBeforePhase4 = "2026-09-18T18:59:59.999Z";
    expect(getRegistrationPhase(justBeforePhase4)).toBe("phase-3");
  });

  it("classifies registration created at or after 19 September 2026 (Phase 4) as phase-4", () => {
    const exactStart = PHASE_4_START_ISO;
    expect(getRegistrationPhase(exactStart)).toBe("phase-4");
    expect(getRegistrationPhase(new Date(exactStart))).toBe("phase-4");

    const afterStart = "2026-09-19T10:00:00.000Z";
    expect(getRegistrationPhase(afterStart)).toBe("phase-4");
    expect(getRegistrationPhase({ createdAt: afterStart })).toBe("phase-4");
  });

  it("keeps Web 3rd module, App 3rd module, and AI 2nd module strictly in Phase 3 regardless of registration date", () => {
    const web3rdModule = {
      program: "web-development",
      level: "React",
      createdAt: "2026-09-20T10:00:00.000Z",
    };
    expect(getRegistrationPhase(web3rdModule)).toBe("phase-3");

    const app3rdModule = {
      program: "app-development",
      level: "Firebase & APIs",
      createdAt: "2026-09-21T10:00:00.000Z",
    };
    expect(getRegistrationPhase(app3rdModule)).toBe("phase-3");

    const ai2ndModule = {
      program: "artificial-intelligence",
      level: "Module 2: Data to ML Engineer",
      createdAt: "2026-07-30T16:02:16.363Z",
    };
    expect(getRegistrationPhase(ai2ndModule)).toBe("phase-3");
  });

  it("classifies Digital Marketing, Ecommerce, and Graphics Designing strictly as Phase 4", () => {
    expect(getRegistrationPhase({ program: "digital-marketing" })).toBe("phase-4");
    expect(getRegistrationPhase({ program: "ecommerce" })).toBe("phase-4");
    expect(getRegistrationPhase({ program: "graphics-designing" })).toBe("phase-4");

    const marketingStudent = {
      programSlug: "digital-marketing",
      level: "Module 1",
      createdAt: "2026-09-19T10:00:00.000Z",
    };
    expect(getRegistrationPhase(marketingStudent)).toBe("phase-4");
  });
});
