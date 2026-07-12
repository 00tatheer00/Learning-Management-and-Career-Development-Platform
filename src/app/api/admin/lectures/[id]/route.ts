import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { deleteBunnyVideo } from "@/lib/bunny";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user || (user.role !== "admin" && user.role !== "trainer")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  try {
    const { id } = await params;
    const lecture = await prisma.lecture.findUnique({
      where: { id },
    });

    if (!lecture) {
      return NextResponse.json(
        createApiResponse(false, { error: "Lecture not found" }),
        { status: 404 }
      );
    }

    // 1. Delete video from Bunny Stream if it exists
    if (lecture.bunnyVideoId) {
      try {
        await deleteBunnyVideo(lecture.bunnyVideoId);
      } catch (e) {
        console.error("Failed to delete video from Bunny Stream:", e);
      }
    }

    // 2. Delete watch progress associated with the lecture
    await prisma.watchProgress.deleteMany({
      where: { lectureId: id },
    });

    // 3. Delete lecture record from the database
    await prisma.lecture.delete({
      where: { id },
    });

    return NextResponse.json(
      createApiResponse(true, { message: "Lecture deleted successfully" })
    );
  } catch (error) {
    console.error("Lecture deletion error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete lecture";
    return NextResponse.json(
      createApiResponse(false, { error: errorMessage }),
      { status: 500 }
    );
  }
}
