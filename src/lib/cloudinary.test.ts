import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  extractPublicIdFromCloudinaryUrl,
  getDeliveryTypeFromCloudinaryUrl,
  resolvePaymentScreenshotCandidates,
} from "@/lib/cloudinary";

describe("cloudinary payment screenshots", () => {
  const legacyPublicUrl =
    "https://res.cloudinary.com/demo/image/upload/v1710000000/eest/payment-screenshots/old-enrollment.jpg";
  const authenticatedUrl =
    "https://res.cloudinary.com/demo/image/authenticated/s--abc--/v1710000000/eest/payment-screenshots/new-enrollment.jpg";

  beforeEach(() => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });

  it("extracts public_id from legacy public Cloudinary URLs", () => {
    expect(extractPublicIdFromCloudinaryUrl(legacyPublicUrl)).toBe(
      "eest/payment-screenshots/old-enrollment"
    );
  });

  it("detects delivery type from stored URL", () => {
    expect(getDeliveryTypeFromCloudinaryUrl(legacyPublicUrl)).toBe("upload");
    expect(getDeliveryTypeFromCloudinaryUrl(authenticatedUrl)).toBe("authenticated");
  });

  it("builds fallback candidates for records with only legacy URL", () => {
    const candidates = resolvePaymentScreenshotCandidates({
      paymentScreenshot: legacyPublicUrl,
      paymentScreenshotPublicId: null,
    });

    expect(candidates.length).toBeGreaterThanOrEqual(2);
    expect(candidates.some((url) => url.includes("/image/upload/"))).toBe(true);
    expect(candidates).toContain(legacyPublicUrl);
  });

  it("prefers authenticated signing when publicId exists", () => {
    const candidates = resolvePaymentScreenshotCandidates({
      paymentScreenshot: authenticatedUrl,
      paymentScreenshotPublicId: "eest/payment-screenshots/new-enrollment",
    });

    expect(candidates[0]).toContain("/authenticated/");
  });
});
