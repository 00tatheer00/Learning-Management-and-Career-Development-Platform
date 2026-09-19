import { describe, expect, it } from "vitest";
import { ENROLLABLE_PROGRAM_SLUGS, getProgramRegistrationFee } from "@/lib/constants/payment";
import { PROGRAM_CATEGORIES } from "@/lib/constants/program-categories";
import { normalizeProgramSlug } from "@/lib/auth/program-assignment";
import { getTrainerDesignation } from "@/lib/auth/trainer-scope";
import { getRegistrationPhase } from "@/lib/services/phase-service";
import { getRevenueSplitForItem } from "@/lib/constants/revenue-split";
import { resolveCanonicalModule, getProgramModuleNames } from "@/lib/modules/student-module-access";
import { programs, getProgramBySlug } from "@/lib/data/programs";
import { trainers, getTrainersByProgramSlug } from "@/lib/data/trainers";

describe("EEST Portal Course Expansion & Phase 4 Verification", () => {
  it("includes all 6 enrollable courses in single source of truth", () => {
    expect(ENROLLABLE_PROGRAM_SLUGS).toHaveLength(6);
    expect(ENROLLABLE_PROGRAM_SLUGS).toEqual([
      "web-development",
      "app-development",
      "artificial-intelligence",
      "digital-marketing",
      "ecommerce",
      "graphics-designing",
    ]);
  });

  it("verifies registration fee is 1,000 PKR for all 6 programs", () => {
    for (const slug of ENROLLABLE_PROGRAM_SLUGS) {
      expect(getProgramRegistrationFee(slug)).toBe(1000);
    }
  });

  it("maps each program to its primary trainer accurately in PROGRAM_CATEGORIES", () => {
    expect(PROGRAM_CATEGORIES["web-development"].primaryTrainerSeedId).toBe("trainer-tatheer");
    expect(PROGRAM_CATEGORIES["app-development"].primaryTrainerSeedId).toBe("trainer-talha");
    expect(PROGRAM_CATEGORIES["artificial-intelligence"].primaryTrainerSeedId).toBe("trainer-faiza");
    expect(PROGRAM_CATEGORIES["digital-marketing"].primaryTrainerSeedId).toBe("trainer-zunira");
    expect(PROGRAM_CATEGORIES["ecommerce"].primaryTrainerSeedId).toBe("trainer-usman");
    expect(PROGRAM_CATEGORIES["graphics-designing"].primaryTrainerSeedId).toBe("trainer-fazal");
  });

  it("verifies trainers exist with active designations", () => {
    const usman = trainers.find((t) => t.id === "trainer-usman");
    expect(usman).toBeDefined();
    expect(usman?.programSlug).toBe("ecommerce");
    expect(usman?.designation).toBe("Ecommerce Trainer");

    const fazal = trainers.find((t) => t.id === "trainer-fazal");
    expect(fazal).toBeDefined();
    expect(fazal?.programSlug).toBe("graphics-designing");
    expect(fazal?.designation).toBe("Graphics Designing Trainer");
  });

  it("normalizes program slugs reliably for all 6 courses", () => {
    expect(normalizeProgramSlug("Web Development")).toBe("web-development");
    expect(normalizeProgramSlug("Flutter App Dev")).toBe("app-development");
    expect(normalizeProgramSlug("Artificial Intelligence Bootcamp")).toBe("artificial-intelligence");
    expect(normalizeProgramSlug("Digital Marketing with SEO")).toBe("digital-marketing");
    expect(normalizeProgramSlug("Shopify Ecommerce Store")).toBe("ecommerce");
    expect(normalizeProgramSlug("Graphics Designing & Photoshop")).toBe("graphics-designing");
  });

  it("verifies active courses have populated modules in programs catalog", () => {
    const ecom = getProgramBySlug("ecommerce");
    expect(ecom?.category).toBe("active");
    expect(ecom?.modules.length).toBeGreaterThanOrEqual(3);

    const graphics = getProgramBySlug("graphics-designing");
    expect(graphics?.category).toBe("active");
    expect(graphics?.modules.length).toBeGreaterThanOrEqual(3);
  });

  it("resolves canonical modules accurately for Ecommerce and Graphics Designing", () => {
    const ecomMod1 = resolveCanonicalModule("ecommerce", "Ecommerce Fundamentals");
    expect(ecomMod1).toBe("Ecommerce Fundamentals");

    const ecomMod2 = resolveCanonicalModule("ecommerce", "Store Setup & Product Management");
    expect(ecomMod2).toBe("Store Setup & Product Management");

    const graphicsMod1 = resolveCanonicalModule("graphics-designing", "Design Fundamentals & Tools");
    expect(graphicsMod1).toBe("Design Fundamentals & Tools");
  });

  it("computes revenue splits correctly across all phases", () => {
    // Phase 1: 800 trainer / 0 school / 200 mgmt
    const p1Split = getRevenueSplitForItem({ createdAt: new Date("2026-07-10T12:00:00Z") });
    expect(p1Split).toEqual({
      gross: 1000,
      management: 200,
      trainer: 800,
      school: 0,
    });

    // Phase 2: 700 trainer / 100 school / 200 mgmt
    const p2Split = getRevenueSplitForItem({ createdAt: new Date("2026-08-01T12:00:00Z") });
    expect(p2Split).toEqual({
      gross: 1000,
      management: 200,
      trainer: 700,
      school: 100,
    });

    // Phase 3: 700 trainer / 100 school / 200 mgmt
    const p3Split = getRevenueSplitForItem({ createdAt: new Date("2026-09-05T12:00:00Z") });
    expect(p3Split).toEqual({
      gross: 1000,
      management: 200,
      trainer: 700,
      school: 100,
    });

    // Phase 4: 700 trainer / 100 school / 200 mgmt
    const p4Split = getRevenueSplitForItem({ createdAt: new Date("2026-09-20T12:00:00Z") });
    expect(p4Split).toEqual({
      gross: 1000,
      management: 200,
      trainer: 700,
      school: 100,
    });
  });

  it("classifies registration phase accurately based on date threshold", () => {
    expect(getRegistrationPhase("2026-07-20T00:00:00.000Z")).toBe("phase-1");
    expect(getRegistrationPhase("2026-08-10T00:00:00.000Z")).toBe("phase-2");
    expect(getRegistrationPhase("2026-09-05T00:00:00.000Z")).toBe("phase-3");
    expect(getRegistrationPhase("2026-09-20T00:00:00.000Z")).toBe("phase-4");
  });
});
