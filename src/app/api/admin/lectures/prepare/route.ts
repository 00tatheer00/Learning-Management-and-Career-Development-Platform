import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { createBunnyVideo } from "@/lib/bunny";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;
const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY;

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

    if (!BUNNY_STREAM_LIBRARY_ID || !BUNNY_STREAM_API_KEY) {
      return NextResponse.json(createApiResponse(false, { error: "Bunny Stream is not configured" }), { status: 500 });
    }

    const videoId = await createBunnyVideo(title);

    const libraryId = BUNNY_STREAM_LIBRARY_ID.trim();
    const apiKey = BUNNY_STREAM_API_KEY.trim();
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
    const errorMessage = error instanceof Error ? error.message : "Failed to prepare upload";
    return NextResponse.json(
      createApiResponse(false, { error: errorMessage }),
      { status: 500 }
    );
  }
}
