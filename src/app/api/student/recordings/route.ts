import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { getClassProgress } from "@/lib/class-schedule";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  filterByStudentModule,
  getStudentModuleContentContext,
  studentHasModuleLiveContent,
} from "@/lib/modules/student-module-content";
import { getLiveSessionsPreview } from "@/lib/api/portal-data";
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
  const programSlugs = getStudentPortalProgramSlugs(user);
  const primaryProgramSlug = context.programSlug;
  const sessions = await fetchMergedByProgram(programSlugs, getLiveSessionsPreview);
  const canAccess = studentHasModuleLiveContent(context, sessions);

  if (!canAccess) {
    return NextResponse.json(
      createApiResponse(true, {
        data: {
          recordings: [],
          progress: getClassProgress(primaryProgramSlug),
          programSlug: primaryProgramSlug,
        },
      })
    );
  }

  const allRecordings = await fetchMergedByProgram(programSlugs, getClassRecordings);
  const recordings = filterByStudentModule(allRecordings, context, (item) => item.level);

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
