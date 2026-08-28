import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";
import { getBunnyVideoDetails } from "@/lib/bunny";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || (user.role !== "admin" && user.role !== "trainer")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const forceSync = searchParams.get("sync") === "true";

  try {
    const lectures = await prisma.lecture.findMany({
      orderBy: [
        { programSlug: "asc" },
        { order: "asc" }
      ]
    });

    // Auto-sync missing durations or force-sync all from Bunny Stream
    const syncedLectures = await Promise.all(
      lectures.map(async (lecture) => {
        if (!lecture.bunnyVideoId) return lecture;
        
        // If forceSync is true OR duration is missing/zero, fetch from Bunny
        if (forceSync || !lecture.duration || lecture.duration <= 0) {
          try {
            const details = await getBunnyVideoDetails(lecture.bunnyVideoId);
            if (details && details.length > 0 && details.length !== lecture.duration) {
              const updated = await prisma.lecture.update({
                where: { id: lecture.id },
                data: { duration: details.length },
              });
              return updated;
            }
          } catch (err) {
            console.error(`Failed to sync duration for lecture ${lecture.id}:`, err);
          }
        }
        return lecture;
      })
    );

    return NextResponse.json(createApiResponse(true, { data: syncedLectures }));
  } catch (error) {
    const errorMessage = "Failed to load lectures";
    return NextResponse.json(
      createApiResponse(false, { error: errorMessage }),
      { status: 500 }
    );
  }
}
