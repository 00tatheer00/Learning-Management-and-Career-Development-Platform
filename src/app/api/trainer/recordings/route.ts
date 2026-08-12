import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireTrainerProgram, resolveTrainerId } from "@/lib/auth/trainer-scope";
import { getFirstModuleName, getProgramModuleNames } from "@/lib/modules/student-module-access";
import {
  deleteClassRecording,
  getClassRecordings,
  isValidRecordingUrl,
  upsertClassRecording,
} from "@/lib/api/class-recordings";
import { createApiResponse } from "@/lib/api/enrollment";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  try {
    const programSlug = requireTrainerProgram(user);
    const allRecordings = await getClassRecordings(programSlug);

    const programModules = getProgramModuleNames(programSlug);
    const rawActiveLevel = user.level?.trim();
    const activeLevel =
      rawActiveLevel && rawActiveLevel !== "all"
        ? rawActiveLevel
        : programModules[0] || "HTML & CSS";

    const normActive = activeLevel.toLowerCase().trim();

    const recordings = allRecordings.filter((r) => {
      const itemLevel = (r.level || programModules[0] || "HTML & CSS").toLowerCase().trim();
      return itemLevel === normActive;
    });

    return NextResponse.json(createApiResponse(true, { data: recordings }));
  } catch {
    return NextResponse.json(createApiResponse(false, { error: "Trainer course not configured" }), {
      status: 400,
    });
  }
}

const upsertSchema = z.object({
  classNumber: z.number().int().min(1).max(200),
  title: z.string().min(2).max(120),
  driveUrl: z.string().url().refine(isValidRecordingUrl, "Use a Google Drive, YouTube, or Loom link"),
  notes: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  try {
    const programSlug = requireTrainerProgram(user);
    const parsed = upsertSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        createApiResponse(false, {
          message: parsed.error.issues[0]?.message ?? "Invalid recording data",
        }),
        { status: 400 }
      );
    }

    const programModules = getProgramModuleNames(programSlug);
    const rawActiveLevel = user.level?.trim();
    const activeLevel =
      rawActiveLevel && rawActiveLevel !== "all"
        ? rawActiveLevel
        : programModules[0] || "HTML & CSS";

    const recording = await upsertClassRecording({
      programSlug,
      level: activeLevel,
      classNumber: parsed.data.classNumber,
      title: parsed.data.title,
      driveUrl: parsed.data.driveUrl,
      trainerId: resolveTrainerId(user),
      trainerName: user.name,
      notes: parsed.data.notes,
    });

    return NextResponse.json(createApiResponse(true, { data: recording }));
  } catch {
    return NextResponse.json(createApiResponse(false, { error: "Could not save recording" }), {
      status: 400,
    });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(createApiResponse(false, { message: "Recording id required" }), {
      status: 400,
    });
  }

  const deleted = await deleteClassRecording(id, resolveTrainerId(user));
  if (!deleted) {
    return NextResponse.json(createApiResponse(false, { error: "Recording not found" }), {
      status: 404,
    });
  }

  return NextResponse.json(createApiResponse(true, { data: { deleted: true } }));
}
