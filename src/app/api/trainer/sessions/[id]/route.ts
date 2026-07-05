import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionById, updateLiveSession } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { isValidMeetLink, normalizeMeetLink } from "@/lib/sessions/meet-link";

const schema = z.object({
  title: z.string().min(2).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  meetLink: z
    .string()
    .min(1, "Google Meet link is required")
    .transform(normalizeMeetLink)
    .refine(isValidMeetLink, "Enter a valid Google Meet or Zoom link"),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const { id } = await params;
  const existing = await getLiveSessionById(id);

  if (!existing) {
    return NextResponse.json(createApiResponse(false, { error: "Class not found" }), {
      status: 404,
    });
  }

  const trainerId = user.trainerId ?? user.id;
  if (existing.trainerId !== trainerId) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        createApiResponse(false, {
          message: parsed.error.issues[0]?.message ?? "Please check the fields",
        }),
        { status: 400 }
      );
    }

    const session = await updateLiveSession(id, {
      ...parsed.data,
      meetLink: parsed.data.meetLink,
    });

    if (!session) {
      return NextResponse.json(createApiResponse(false, { error: "Could not update class" }), {
        status: 500,
      });
    }

    return NextResponse.json(createApiResponse(true, { data: session }));
  } catch {
    return NextResponse.json(createApiResponse(false, { error: "Update failed" }), {
      status: 400,
    });
  }
}
