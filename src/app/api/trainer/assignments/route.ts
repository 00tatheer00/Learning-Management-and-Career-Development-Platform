import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireTrainerProgram } from "@/lib/auth/trainer-scope";
import { createAssignment } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  dueDate: z.string(),
  programSlug: z.string().optional(),
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
      return NextResponse.json(createApiResponse(false, { message: "Invalid data" }), {
        status: 400,
      });
    }

    if (parsed.data.programSlug && parsed.data.programSlug !== programSlug) {
      return NextResponse.json(
        createApiResponse(false, { error: "You can only create assignments for your course" }),
        { status: 403 }
      );
    }

    const assignment = await createAssignment({
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate,
      programSlug,
      trainerId: user.trainerId ?? user.id,
    });

    return NextResponse.json(createApiResponse(true, { data: assignment }));
  } catch {
    return NextResponse.json(
      createApiResponse(false, { error: "Trainer course not configured" }),
      { status: 400 }
    );
  }
}
