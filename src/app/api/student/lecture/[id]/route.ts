import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { canStudentAccessProgram } from "@/lib/student-portal/program-scope";
import { generateBunnyEmbedUrl } from "@/lib/bunny";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { id } = await params;
    const lecture = await prisma.lecture.findUnique({
      where: { id },
    });

    if (!lecture) {
      return NextResponse.json(createApiResponse(false, { error: "Lecture not found" }), { status: 404 });
    }

    if (!lecture.bunnyVideoId) {
      return NextResponse.json(createApiResponse(false, { error: "Lecture video not uploaded yet" }), { status: 400 });
    }

    // Verify enrollment if user is a student
    if (user.role === "student") {
      const isEnrolled = canStudentAccessProgram(user, lecture.programSlug);
      if (!isEnrolled) {
        return NextResponse.json(
          createApiResponse(false, { error: "Forbidden: You are not enrolled in this course" }),
          { status: 403 }
        );
      }
    } else if (user.role !== "admin" && user.role !== "trainer") {
      return NextResponse.json(createApiResponse(false, { error: "Forbidden" }), { status: 403 });
    }

    // Generate token-authorized embed URL (valid for 5 minutes / 300 seconds)
    const playbackUrl = generateBunnyEmbedUrl(lecture.bunnyVideoId, 300);

    // Retrieve any saved watch progress
    const progress = await prisma.watchProgress.findUnique({
      where: {
        userId_lectureId: {
          userId: user.id,
          lectureId: id,
        },
      },
    });

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          playbackUrl,
          watchedSeconds: progress?.watchedSeconds ?? 0,
          completed: progress?.completed ?? false,
          lecture: {
            id: lecture.id,
            title: lecture.title,
            description: lecture.description,
            duration: lecture.duration,
          },
        },
      })
    );
  } catch (error) {
    console.error("Lecture playback error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to load playback data";
    return NextResponse.json(
      createApiResponse(false, { error: errorMessage }),
      { status: 500 }
    );
  }
}
