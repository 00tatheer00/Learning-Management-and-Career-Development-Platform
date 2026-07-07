import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { getClassProgress } from "@/lib/class-schedule";
import { createApiResponse } from "@/lib/api/enrollment";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  const programSlug = user.programSlug ?? "web-development";
  const [recordings, progress] = await Promise.all([
    getClassRecordings(programSlug),
    Promise.resolve(getClassProgress(programSlug)),
  ]);

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        recordings,
        progress,
        programSlug,
      },
    })
  );
}
