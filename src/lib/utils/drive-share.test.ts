import { describe, expect, it } from "vitest";
import {
  chunkEmailsForDriveShare,
  DRIVE_SHARE_LIMITS,
  formatEmailsForDriveShare,
} from "@/lib/utils/drive-share";

describe("drive-share", () => {
  it("chunks emails for safe Drive paste batches", () => {
    const emails = Array.from({ length: 95 }, (_, i) => `user${i}@test.com`);
    const batches = chunkEmailsForDriveShare(emails);
    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(DRIVE_SHARE_LIMITS.recommendedPasteBatch);
    expect(batches[1]).toHaveLength(DRIVE_SHARE_LIMITS.recommendedPasteBatch);
    expect(batches[2]).toHaveLength(15);
  });

  it("formats comma-separated list", () => {
    expect(formatEmailsForDriveShare(["a@b.com", "c@d.com"])).toBe("a@b.com, c@d.com");
  });
});
