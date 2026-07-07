import { v2 as cloudinary } from "cloudinary";

let configured = false;

export type CloudinaryDeliveryType = "authenticated" | "upload";

function ensureCloudinary() {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
}

export async function uploadPaymentScreenshot(
  file: File,
  enrollmentId: string
): Promise<{ url: string; publicId: string }> {
  return uploadEnrollmentImage(file, enrollmentId, "eest/payment-screenshots");
}

export async function uploadProfilePhoto(
  file: File,
  enrollmentId: string
): Promise<{ url: string; publicId: string }> {
  return uploadEnrollmentImage(file, `${enrollmentId}-profile`, "eest/profile-photos");
}

async function uploadEnrollmentImage(
  file: File,
  publicId: string,
  folder: string
): Promise<{ url: string; publicId: string }> {
  ensureCloudinary();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type || "image/jpeg"};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: publicId,
    resource_type: "image",
    type: "authenticated",
    access_mode: "authenticated",
    overwrite: true,
    invalidate: true,
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export function getDeliveryTypeFromCloudinaryUrl(url: string): CloudinaryDeliveryType {
  return url.includes("/authenticated/") ? "authenticated" : "upload";
}

/** Extract Cloudinary public_id from a stored secure_url. */
export function extractPublicIdFromCloudinaryUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("res.cloudinary.com")) return null;

    const match = parsed.pathname.match(/\/(?:image|video)\/(?:upload|authenticated)\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+)$/i);
    if (!match?.[1]) return null;

    return decodeURIComponent(match[1]).replace(/\.[a-z0-9]+$/i, "");
  } catch {
    return null;
  }
}

export function normalizeCloudinaryPublicId(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (trimmed.includes("cloudinary.com")) {
    return extractPublicIdFromCloudinaryUrl(trimmed);
  }
  return trimmed.replace(/\.[a-z0-9]+$/i, "");
}

export function getSignedCloudinaryUrl(
  publicId: string,
  options?: { expiresInSeconds?: number; deliveryType?: CloudinaryDeliveryType }
): string {
  ensureCloudinary();
  const expiresAt = Math.floor(Date.now() / 1000) + (options?.expiresInSeconds ?? 3600);
  return cloudinary.url(publicId, {
    type: options?.deliveryType ?? "authenticated",
    sign_url: true,
    secure: true,
    expires_at: expiresAt,
  });
}

export function resolvePaymentScreenshotCandidates(input: {
  paymentScreenshot?: string | null;
  paymentScreenshotPublicId?: string | null;
}): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const add = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push(url);
  };

  const publicId =
    normalizeCloudinaryPublicId(input.paymentScreenshotPublicId) ??
    (input.paymentScreenshot?.includes("res.cloudinary.com")
      ? extractPublicIdFromCloudinaryUrl(input.paymentScreenshot)
      : null);

  if (publicId) {
    const preferredType = input.paymentScreenshot?.includes("res.cloudinary.com")
      ? getDeliveryTypeFromCloudinaryUrl(input.paymentScreenshot)
      : "authenticated";

    const alternateType: CloudinaryDeliveryType =
      preferredType === "authenticated" ? "upload" : "authenticated";

    add(getSignedCloudinaryUrl(publicId, { deliveryType: preferredType }));
    add(getSignedCloudinaryUrl(publicId, { deliveryType: alternateType }));
  }

  if (input.paymentScreenshot?.startsWith("http")) {
    add(input.paymentScreenshot);
  }

  return candidates;
}

export async function fetchFirstAvailableImage(
  urls: string[]
): Promise<{ buffer: Buffer; contentType: string; sourceUrl: string } | null> {
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") ?? "image/jpeg";
      if (!contentType.startsWith("image/")) continue;

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length === 0) continue;

      return { buffer, contentType, sourceUrl: url };
    } catch (error) {
      console.error("Cloudinary fetch failed:", url, error);
    }
  }

  return null;
}

export function getScreenshotUrl(paymentScreenshot?: string | null): string | null {
  if (!paymentScreenshot) return null;
  if (paymentScreenshot.startsWith("http")) return paymentScreenshot;
  return null;
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  try {
    ensureCloudinary();
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
  }
}
