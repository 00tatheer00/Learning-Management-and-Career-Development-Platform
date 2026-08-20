import { describe, it, expect } from "vitest";
import { uploadDirectToCloudinary } from "./cloudinary-client";

describe("Cloudinary Client Direct Upload Helper", () => {
  it("should export uploadDirectToCloudinary function", () => {
    expect(typeof uploadDirectToCloudinary).toBe("function");
  });
});
