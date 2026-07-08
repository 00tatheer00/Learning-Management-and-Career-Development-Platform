import { describe, expect, it } from "vitest";
import { timingSafeEqual } from "crypto";

function safeStringEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

describe("student login password helpers", () => {
  it("compares passwords safely", () => {
    expect(safeStringEqual("Ab12Cd34", "Ab12Cd34")).toBe(true);
    expect(safeStringEqual("Ab12Cd34", "Ab12Cd35")).toBe(false);
    expect(safeStringEqual("short", "longer")).toBe(false);
  });
});
