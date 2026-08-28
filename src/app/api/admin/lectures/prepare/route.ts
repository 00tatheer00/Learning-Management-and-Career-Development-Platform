import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { createBunnyVideo, getBunnyConfig } from "@/lib/bunny";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || (user.role !== "admin" && user.role !== "trainer")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  try {
    const { title } = await request.json();
    if (!title) {
      return NextResponse.json(createApiResponse(false, { error: "Title is required" }), { status: 400 });
    }

    const { libraryId, apiKey } = getBunnyConfig();
    const videoId = await createBunnyVideo(title);
    const expirationTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours

    // Generate secure upload signature: SHA256(LibraryId + ApiKey + ExpirationTime + VideoId)
    const signatureStr = libraryId + apiKey + expirationTime + videoId;
    const signature = crypto
      .createHash("sha256")
      .update(signatureStr)
      .digest("hex");

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          libraryId,
          videoId,
          signature,
          expirationTime,
        },
      })
    );
  } catch (error) {
    console.error("Lecture prepare upload error:", error);
    const errorMessage = "Failed to prepare upload";
    return NextResponse.json(
      createApiResponse(false, { error: errorMessage }),
      { status: 500 }
    );
  }
}
