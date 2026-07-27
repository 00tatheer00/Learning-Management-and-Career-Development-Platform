import { describe, expect, it } from "vitest";
import { getRevenueSplitForItem, calculateTotalRevenue } from "./revenue-split";

describe("revenue-split phase and program logic", () => {
  it("calculates Phase 1 revenue split correctly (1000 gross, 200 management, 800 trainer, 0 school)", () => {
    const item = {
      program: "artificial-intelligence",
      batch: "Batch 1",
      createdAt: "2026-07-01T10:00:00.000Z", // Phase 1 date
    };

    const split = getRevenueSplitForItem(item);
    expect(split).toEqual({
      gross: 1000,
      management: 200,
      trainer: 800,
      school: 0,
    });
  });

  it("calculates Phase 2 Artificial Intelligence revenue split correctly (1000 gross, 200 management, 800 trainer, 0 school)", () => {
    const item = {
      program: "artificial-intelligence",
      batch: "Phase 2",
    };

    const split = getRevenueSplitForItem(item);
    expect(split).toEqual({
      gross: 1000,
      management: 200,
      trainer: 800,
      school: 0,
    });
  });

  it("calculates Phase 2 App Development revenue split correctly (1000 gross, 200 management, 700 trainer, 100 school)", () => {
    const item = {
      program: "app-development",
      batch: "Phase 2",
    };

    const split = getRevenueSplitForItem(item);
    expect(split).toEqual({
      gross: 1000,
      management: 200,
      trainer: 700,
      school: 100,
    });
  });

  it("calculates Phase 2 Web Development revenue split correctly (1000 gross, 200 management, 800 trainer, 0 school)", () => {
    const item = {
      program: "web-development",
      batch: "Phase 2",
    };

    const split = getRevenueSplitForItem(item);
    expect(split).toEqual({
      gross: 1000,
      management: 200,
      trainer: 800,
      school: 0,
    });
  });

  it("calculates total revenue correctly across a list of enrollments", () => {
    const items = [
      { program: "artificial-intelligence", batch: "Batch 1" }, // Phase 1: 1000 gross (200 mgmt, 800 trainer, 0 school)
      { program: "artificial-intelligence", batch: "Phase 2" }, // Phase 2: 1000 gross (200 mgmt, 800 trainer, 0 school)
      { program: "app-development", batch: "Phase 2" },         // Phase 2: 1000 gross (200 mgmt, 700 trainer, 100 school)
    ];

    const total = calculateTotalRevenue(items);
    expect(total).toEqual({
      gross: 3000,
      management: 600,
      trainer: 2300,
      school: 100,
    });
  });
});
