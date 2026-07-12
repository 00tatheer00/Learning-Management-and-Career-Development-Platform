import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { lectureId, watchedSeconds, completed } = await request.json();

    if (!lectureId || watchedSeconds === undefined || completed === undefined) {
      return NextResponse.json(
        createApiResponse(false, { error: "Missing required fields (lectureId, watchedSeconds, completed)" }),
        { status: 400 }
      );
    }

    const seconds = parseFloat(watchedSeconds);
    const isCompleted = Boolean(completed);

    if (isNaN(seconds)) {
      return NextResponse.json(
        createApiResponse(false, { error: "watchedSeconds must be a valid number" }),
        { status: 400 }
      );
    }

    const progress = await prisma.watchProgress.upsert({
      where: {
        userId_lectureId: {
          userId: user.id,
          lectureId,
        },
      },
      update: {
        watchedSeconds: seconds,
        completed: isCompleted,
      },
      create: {
        id: `${user.id}-${lectureId}`,
        userId: user.id,
        lectureId,
        watchedSeconds: seconds,
        completed: isCompleted,
      },
    });

    return NextResponse.json(createApiResponse(true, { data: progress }));
  } catch (error) {
    console.error("Watch progress save error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save watch progress";
    return NextResponse.json(
      createApiResponse(false, { error: errorMessage }),
      { status: 500 }
    );
  }
}
