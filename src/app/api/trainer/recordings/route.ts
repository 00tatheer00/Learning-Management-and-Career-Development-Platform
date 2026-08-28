import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireTrainerProgram, resolveTrainerId } from "@/lib/auth/trainer-scope";
import {
  deleteClassRecording,
  getClassRecordings,
  isValidRecordingUrl,
  resolveCanonicalModule,
  upsertClassRecording,
} from "@/lib/api/class-recordings";
import { createApiResponse } from "@/lib/api/enrollment";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const requestedModule = searchParams.get("module");
    const requestedProgram = searchParams.get("programSlug");

    let programSlug = requestedProgram?.trim() || user.programSlug?.trim();
    if (!programSlug) {
      try {
        programSlug = requireTrainerProgram(user);
      } catch {
        programSlug = "web-development";
      }
    }

    const allRecordings = await getClassRecordings(programSlug);
    const activeScope = (requestedModule ?? user.level ?? "all").trim();

    // If activeScope is "all", return all recordings
    if (activeScope.toLowerCase() === "all") {
      return NextResponse.json(createApiResponse(true, { data: allRecordings }));
    }

    const canonicalScope = resolveCanonicalModule(programSlug, activeScope);

    const recordings = allRecordings.filter((r) => {
      const itemCanonical = resolveCanonicalModule(r.programSlug, r.level);
      return itemCanonical === canonicalScope;
    });

    return NextResponse.json(createApiResponse(true, { data: recordings }));
  } catch (error: unknown) {
    const errMessage = "Trainer course not configured";
    console.error("[TRAINER_RECORDINGS_GET_ERROR]", error);
    return NextResponse.json(
      createApiResponse(false, { error: errMessage }),
      { status: 400 }
    );
  }
}

const upsertSchema = z.object({
  programSlug: z.string().optional(),
  classNumber: z.coerce.number().int().min(1).max(500),
  title: z.string().trim().min(1, "Please provide a class title").max(150),
  driveUrl: z
    .string()
    .trim()
    .min(5, "Please enter a recording link")
    .refine(isValidRecordingUrl, "Please provide a valid Google Drive, YouTube, or video URL"),
  notes: z.string().max(1000).optional().nullable(),
  level: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = upsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        createApiResponse(false, {
          message: parsed.error.issues[0]?.message ?? "Invalid recording data",
          error: parsed.error.issues[0]?.message ?? "Invalid recording data",
        }),
        { status: 400 }
      );
    }

    let programSlug = parsed.data.programSlug?.trim() || user.programSlug?.trim();
    if (!programSlug) {
      try {
        programSlug = requireTrainerProgram(user);
      } catch {
        programSlug = "web-development";
      }
    }

    const rawActiveLevel = parsed.data.level?.trim() || user.level?.trim();
    const activeLevel = resolveCanonicalModule(programSlug, rawActiveLevel);

    const recording = await upsertClassRecording({
      programSlug,
      level: activeLevel,
      classNumber: parsed.data.classNumber,
      title: parsed.data.title,
      driveUrl: parsed.data.driveUrl,
      trainerId: resolveTrainerId(user) || user.id || "trainer",
      trainerName: user.name?.trim() || "Trainer",
      notes: parsed.data.notes?.trim() || undefined,
    });

    return NextResponse.json(createApiResponse(true, { data: recording }));
  } catch (error: unknown) {
    const errMessage = "Could not save recording";
    console.error("[TRAINER_RECORDINGS_POST_ERROR]", error);
    return NextResponse.json(
      createApiResponse(false, {
        error: errMessage,
        message: errMessage,
      }),
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(createApiResponse(false, { message: "Recording id required" }), {
        status: 400,
      });
    }

    const deleted = await deleteClassRecording(
      id,
      user.role === "admin" ? undefined : resolveTrainerId(user)
    );
    if (!deleted) {
      return NextResponse.json(createApiResponse(false, { error: "Recording not found" }), {
        status: 404,
      });
    }

    return NextResponse.json(createApiResponse(true, { data: { deleted: true } }));
  } catch (error: unknown) {
    const errMessage = "Could not delete recording";
    console.error("[TRAINER_RECORDINGS_DELETE_ERROR]", error);
    return NextResponse.json(
      createApiResponse(false, { error: errMessage }),
      { status: 400 }
    );
  }
}
