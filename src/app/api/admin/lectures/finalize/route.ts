import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";
import { deleteBunnyVideo } from "@/lib/bunny";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || (user.role !== "admin" && user.role !== "trainer")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  try {
    const {
      title,
      description,
      programSlug,
      level,
      order,
      duration,
      bunnyVideoId,
      lectureId,
    } = await request.json();

    if (!title || !programSlug || !order || !bunnyVideoId) {
      return NextResponse.json(
        createApiResponse(false, { error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const orderNum = parseInt(order, 10);
    const durationNum = duration ? parseFloat(duration) : null;

    if (lectureId) {
      const existing = await prisma.lecture.findUnique({
        where: { id: lectureId },
      });

      if (!existing) {
        return NextResponse.json(
          createApiResponse(false, { error: "Lecture not found" }),
          { status: 404 }
        );
      }

      // If video was replaced, delete old video from Bunny Stream
      if (existing.bunnyVideoId && existing.bunnyVideoId !== bunnyVideoId) {
        try {
          await deleteBunnyVideo(existing.bunnyVideoId);
        } catch (e) {
          console.error("Failed to delete old video:", e);
        }
      }

      const updated = await prisma.lecture.update({
        where: { id: lectureId },
        data: {
          title,
          description: description || "",
          programSlug,
          level: level || null,
          order: orderNum,
          bunnyVideoId,
          duration: durationNum ?? existing.duration,
        },
      });

      return NextResponse.json(
        createApiResponse(true, {
          data: updated,
          message: "Lecture updated successfully.",
        })
      );
    } else {
      const created = await prisma.lecture.create({
        data: {
          id: crypto.randomUUID(),
          title,
          description: description || "",
          programSlug,
          level: level || null,
          order: orderNum,
          bunnyVideoId,
          duration: durationNum ?? 0,
        },
      });

      return NextResponse.json(
        createApiResponse(true, {
          data: created,
          message: "Lecture created successfully.",
        })
      );
    }
  } catch (error) {
    console.error("Lecture finalize error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to finalize lecture";
    return NextResponse.json(
      createApiResponse(false, { error: errorMessage }),
      { status: 500 }
    );
  }
}
