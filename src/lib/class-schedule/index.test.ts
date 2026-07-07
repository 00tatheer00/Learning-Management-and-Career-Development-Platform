import { describe, expect, it } from "vitest";
import { generateClassSlots, getClassProgress } from "@/lib/class-schedule";

describe("class schedule", () => {
  it("numbers web classes from Mon 6 July 2026", () => {
    const slots = generateClassSlots("web-development", { maxClasses: 5 });
    expect(slots[0]).toMatchObject({ classNumber: 1, date: "2026-07-06" });
    expect(slots[1]).toMatchObject({ classNumber: 2, date: "2026-07-07" });
    expect(slots[2]).toMatchObject({ classNumber: 3, date: "2026-07-08" });
  });

  it("marks class 1 done and class 2 as today on 7 July before 10pm PKT", () => {
    const now = new Date("2026-07-07T16:00:00.000Z"); // 9pm PKT
    const progress = getClassProgress("web-development", now);
    expect(progress.completedCount).toBe(1);
    expect(progress.todaySlot?.classNumber).toBe(2);
  });

  it("uses Fri-Sun schedule for app development", () => {
    const slots = generateClassSlots("app-development", { maxClasses: 3 });
    expect(slots[0]?.date).toBe("2026-07-03");
    expect(slots[1]?.date).toBe("2026-07-04");
    expect(slots[2]?.date).toBe("2026-07-05");
  });
});
