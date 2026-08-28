import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createApiResponse } from "@/lib/api/enrollment";

function ensureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return { cloudName, apiKey, apiSecret };
}

export async function POST(request: Request) {
  try {
    const { cloudName, apiKey, apiSecret } = ensureCloudinary();
    const body = await request.json().catch(() => ({}));
    const folder = (typeof body?.folder === "string" && body.folder.trim())
      ? body.folder.trim()
      : "eest/payment-screenshots";
    const customPublicId = typeof body?.publicId === "string" ? body.publicId.trim() : undefined;

    // Generate UNIX timestamp for signature expiry (valid for 10 minutes)
    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
      transformation: "w_800,h_800,c_limit",
    };

    if (customPublicId) {
      paramsToSign.public_id = customPublicId;
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          signature,
          timestamp,
          apiKey,
          cloudName,
          folder,
          publicId: customPublicId,
          transformation: "w_800,h_800,c_limit",
        },
      })
    );
  } catch (error) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json(
      createApiResponse(false, {
        error: "Failed to generate upload signature",
      }),
      { status: 500 }
    );
  }
}
