import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireTrainerProgram } from "@/lib/auth/trainer-scope";
import { createLiveSession } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { notifyStudentsOfLiveClass } from "@/lib/notifications/live-class-notice";
import { isLiveKitConfigured } from "@/lib/livekit/config";

const schema = z
  .object({
    title: z.string().min(2),
    date: z.string(),
    time: z.string(),
    roomType: z.enum(["portal", "meet"]).default("portal"),
    meetLink: z.string().url().optional().or(z.literal("")),
    programSlug: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.roomType === "meet" && !data.meetLink) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Meeting link is required for external classes",
        path: ["meetLink"],
      });
    }
    if (data.roomType === "portal" && !isLiveKitConfigured()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Portal video is not configured. Use external link or ask admin to add LiveKit keys.",
        path: ["roomType"],
      });
    }
  });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const programSlug = requireTrainerProgram(user);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        createApiResponse(false, {
          message: parsed.error.issues[0]?.message ?? "Please fill all fields correctly",
        }),
        { status: 400 }
      );
    }

    if (parsed.data.programSlug && parsed.data.programSlug !== programSlug) {
      return NextResponse.json(
        createApiResponse(false, { error: "You can only schedule classes for your course" }),
        { status: 403 }
      );
    }

    const isPortal = parsed.data.roomType === "portal";

    const session = await createLiveSession({
      title: parsed.data.title,
      date: parsed.data.date,
      time: parsed.data.time,
      meetLink: isPortal ? "" : (parsed.data.meetLink ?? ""),
      roomType: isPortal ? "portal" : "meet",
      programSlug,
      notes: parsed.data.notes,
      trainerId: user.trainerId ?? user.id,
      trainerName: user.name,
    });

    void notifyStudentsOfLiveClass({
      programSlug,
      title: session.title,
      date: session.date,
      time: session.time,
      trainerName: session.trainerName,
    });

    return NextResponse.json(createApiResponse(true, { data: session }));
  } catch {
    return NextResponse.json(
      createApiResponse(false, { error: "Trainer course not configured" }),
      { status: 400 }
    );
  }
}
