import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireTrainerProgram, resolveTrainerId } from "@/lib/auth/trainer-scope";
import { getFirstModuleName } from "@/lib/modules/student-module-access";
import { createLiveSession } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { isValidMeetLink, normalizeMeetLink } from "@/lib/sessions/meet-link";

const schema = z.object({
  title: z.string().min(2),
  date: z.string(),
  time: z.string(),
  roomType: z.enum(["portal", "meet"]).default("meet"),
  meetLink: z
    .string()
    .min(1, "Google Meet link is required")
    .transform(normalizeMeetLink)
    .refine(isValidMeetLink, "Enter a valid Google Meet or Zoom link"),
  programSlug: z.string().optional(),
  notes: z.string().optional(),
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
      meetLink: isPortal ? "" : parsed.data.meetLink,
      roomType: isPortal ? "portal" : "meet",
      programSlug,
      level: user.level ?? getFirstModuleName(programSlug) ?? undefined,
      notes: parsed.data.notes,
      trainerId: resolveTrainerId(user),
      trainerName: user.name,
    });

    return NextResponse.json(createApiResponse(true, { data: session }));
  } catch {
    return NextResponse.json(
      createApiResponse(false, { error: "Trainer course not configured" }),
      { status: 400 }
    );
  }
}
