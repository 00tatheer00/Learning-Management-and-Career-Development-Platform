import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { createBunnyVideo, uploadBunnyVideo, deleteBunnyVideo } from "@/lib/bunny";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || (user.role !== "admin" && user.role !== "trainer")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const programSlug = formData.get("programSlug") as string;
    const level = formData.get("level") as string | null;
    const orderStr = formData.get("order") as string;
    const durationStr = formData.get("duration") as string | null;
    const lectureId = formData.get("lectureId") as string | null;

    if (!title || !programSlug || !orderStr) {
      return NextResponse.json(
        createApiResponse(false, { error: "Missing required fields (title, programSlug, order)" }),
        { status: 400 }
      );
    }

    const order = parseInt(orderStr, 10);
    if (isNaN(order)) {
      return NextResponse.json(
        createApiResponse(false, { error: "Order must be a valid number" }),
        { status: 400 }
      );
    }

    const duration = durationStr ? parseFloat(durationStr) : null;

    // Check if we are replacing/updating an existing lecture
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

      let bunnyVideoId = existing.bunnyVideoId;
      let finalDuration = existing.duration;

      if (file && file.size > 0) {
        // Delete old video if it exists in Bunny Stream
        if (existing.bunnyVideoId) {
          try {
            await deleteBunnyVideo(existing.bunnyVideoId);
          } catch (e) {
            console.error("Failed to delete old Bunny video:", e);
          }
        }

        // Upload new video to Bunny Stream
        bunnyVideoId = await createBunnyVideo(title);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await uploadBunnyVideo(bunnyVideoId, buffer);
        finalDuration = duration ?? 0;
      }

      const updated = await prisma.lecture.update({
        where: { id: lectureId },
        data: {
          title,
          description: description || "",
          programSlug,
          level: level || null,
          order,
          bunnyVideoId,
          duration: finalDuration,
        },
      });

      return NextResponse.json(
        createApiResponse(true, {
          data: updated,
          message: "Lecture updated successfully.",
        })
      );
    } else {
      // New lecture creation
      if (!file || file.size === 0) {
        return NextResponse.json(
          createApiResponse(false, { error: "Video file is required for new lectures" }),
          { status: 400 }
        );
      }

      const bunnyVideoId = await createBunnyVideo(title);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await uploadBunnyVideo(bunnyVideoId, buffer);

      const created = await prisma.lecture.create({
        data: {
          id: crypto.randomUUID(),
          title,
          description: description || "",
          programSlug,
          level: level || null,
          order,
          bunnyVideoId,
          duration: duration ?? 0,
        },
      });

      return NextResponse.json(
        createApiResponse(true, {
          data: created,
          message: "Lecture created and video uploaded successfully.",
        })
      );
    }
  } catch (error) {
    console.error("Lecture upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json(
      createApiResponse(false, { error: errorMessage }),
      { status: 500 }
    );
  }
}
