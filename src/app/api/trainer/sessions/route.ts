import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireTrainerProgram } from "@/lib/auth/trainer-scope";
import { createLiveSession } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";

const schema = z.object({
  title: z.string().min(2),
  date: z.string(),
  time: z.string(),
  meetLink: z.string().url(),
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
        createApiResponse(false, { message: "Please fill all fields correctly" }),
        { status: 400 }
      );
    }

    if (parsed.data.programSlug && parsed.data.programSlug !== programSlug) {
      return NextResponse.json(
        createApiResponse(false, { error: "You can only schedule classes for your course" }),
        { status: 403 }
      );
    }

    const session = await createLiveSession({
      title: parsed.data.title,
      date: parsed.data.date,
      time: parsed.data.time,
      meetLink: parsed.data.meetLink,
      programSlug,
      notes: parsed.data.notes,
      trainerId: user.trainerId ?? user.id,
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
