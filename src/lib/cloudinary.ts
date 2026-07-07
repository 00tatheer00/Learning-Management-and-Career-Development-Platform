import { v2 as cloudinary } from "cloudinary";

let configured = false;

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

export function getSignedCloudinaryUrl(
  publicId: string,
  options?: { expiresInSeconds?: number }
): string {
  ensureCloudinary();
  const expiresAt = Math.floor(Date.now() / 1000) + (options?.expiresInSeconds ?? 900);
  return cloudinary.url(publicId, {
    type: "authenticated",
    sign_url: true,
    secure: true,
    expires_at: expiresAt,
  });
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
