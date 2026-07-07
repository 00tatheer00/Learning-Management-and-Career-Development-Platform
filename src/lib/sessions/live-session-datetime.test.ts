import { describe, expect, it } from "vitest";
import {
  buildLiveSessionTimestamps,
  parseSessionDateTime,
  startsAtToSessionDisplay,
} from "@/lib/sessions/live-session-datetime";

describe("live-session-datetime", () => {
  it("parses Pakistan local class time to UTC instant", () => {
    const at = parseSessionDateTime("2026-07-07", "10:00 PM");
    expect(at?.toISOString()).toBe("2026-07-07T17:00:00.000Z");
  });

  it("round-trips display fields in Pakistan timezone", () => {
    const built = buildLiveSessionTimestamps("2026-07-07", "10:00 PM");
    expect(built?.date).toBe("2026-07-07");
    expect(built?.time).toMatch(/10:00 PM/i);
    const display = startsAtToSessionDisplay(built!.startsAt);
    expect(display.date).toBe("2026-07-07");
  });
});
