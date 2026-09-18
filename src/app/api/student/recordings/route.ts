import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { getClassProgress } from "@/lib/class-schedule";
import { createApiResponse } from "@/lib/api/enrollment";
import { filterByStudentModule } from "@/lib/modules/student-module-content";
import { getStudentModuleContentContext } from "@/lib/modules/student-module-content-server";
import {
  fetchMergedByProgram,
  getStudentPortalProgramSlugs,
} from "@/lib/student-portal/program-scope";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  const context = await getStudentModuleContentContext(user);
  const programSlugs = await getStudentPortalProgramSlugs(user);
  const primaryProgramSlug = context.programSlug;
  const allRecordings = await fetchMergedByProgram(programSlugs, getClassRecordings);
  const recordings = filterByStudentModule(
    allRecordings,
    context,
    (item) => item.level,
    (item) => item.programSlug
  );

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        recordings,
        progress: getClassProgress(primaryProgramSlug),
        programSlug: primaryProgramSlug,
      },
    })
  );
}
