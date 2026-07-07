import { describe, expect, it } from "vitest";
import { copyToClipboard } from "@/lib/utils/clipboard";

describe("copyToClipboard", () => {
  it("returns false for empty text", async () => {
    await expect(copyToClipboard("")).resolves.toBe(false);
  });
});
