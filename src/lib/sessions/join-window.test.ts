import { describe, expect, it } from "vitest";
import { getJoinWindowState } from "@/lib/sessions/join-window";

describe("join window", () => {
  const webSession = {
    sessionDate: "2026-07-07",
    sessionTime: "10:00 PM",
    programSlug: "web-development",
    hasJoinLink: true,
  };

  it("blocks join until 10 minutes before class (9:55 PM PKT)", () => {
    const now = new Date("2026-07-07T16:49:00.000Z"); // 9:49 PM PKT
    const state = getJoinWindowState({ ...webSession, now });
    expect(state.canJoin).toBe(false);
    expect(state.phase).toBe("too_early");
    expect(state.buttonLabel).toBe("Join Class");
  });

  it("opens join at 9:55 PM PKT for a 10 PM class", () => {
    const now = new Date("2026-07-07T16:55:00.000Z"); // 9:55 PM PKT
    const state = getJoinWindowState({ ...webSession, now });
    expect(state.canJoin).toBe(true);
    expect(state.phase).toBe("open");
  });

  it("stays open until 11 PM PKT class end", () => {
    const now = new Date("2026-07-07T17:30:00.000Z"); // 10:30 PM PKT
    const state = getJoinWindowState({ ...webSession, now });
    expect(state.canJoin).toBe(true);
    expect(state.phase).toBe("open");
  });

  it("shows Class Done after 11 PM PKT", () => {
    const now = new Date("2026-07-07T18:05:00.000Z"); // 11:05 PM PKT
    const state = getJoinWindowState({ ...webSession, now });
    expect(state.canJoin).toBe(false);
    expect(state.phase).toBe("ended");
    expect(state.buttonLabel).toBe("Class Done");
  });

  it("shows Class Done for yesterday's class", () => {
    const now = new Date("2026-07-08T12:00:00.000Z");
    const state = getJoinWindowState({
      sessionDate: "2026-07-06",
      sessionTime: "10:00 PM",
      programSlug: "web-development",
      hasJoinLink: true,
      now,
    });
    expect(state.phase).toBe("ended");
    expect(state.buttonLabel).toBe("Class Done");
  });

  it("shows link coming soon when trainer has not added a link", () => {
    const state = getJoinWindowState({
      ...webSession,
      hasJoinLink: false,
    });
    expect(state.phase).toBe("no_link");
    expect(state.buttonLabel).toBe("Link coming soon");
  });
});
