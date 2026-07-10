import { describe, expect, it } from "vitest";
import {
  excludeDemoEnrollments,
  isDemoEnrollment,
} from "@/lib/constants/demo-student";

describe("demo enrollment helpers", () => {
  it("detects demo by email or enrollment id", () => {
    expect(isDemoEnrollment({ email: "tatheerabidi00@gmail.com" })).toBe(true);
    expect(isDemoEnrollment({ id: "enrollment-demo-web-2", email: "other@example.com" })).toBe(
      true
    );
    expect(isDemoEnrollment({ email: "real@example.com", id: "enr-1" })).toBe(false);
  });

  it("excludes all demo enrollments from revenue counts", () => {
    const rows = [
      { id: "enr-1", email: "real@example.com" },
      { id: "enrollment-demo-web-1", email: "tatheerabidi00@gmail.com" },
      { id: "enrollment-demo-web-2", email: "tatheerabidi00@gmail.com" },
    ];

    expect(excludeDemoEnrollments(rows)).toEqual([{ id: "enr-1", email: "real@example.com" }]);
  });
});
