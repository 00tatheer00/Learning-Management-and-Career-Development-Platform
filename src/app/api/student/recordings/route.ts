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

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  const context = await getStudentModuleContentContext(user);
  const programSlug = context.programSlug;
  const sessions = await getLiveSessionsPreview(programSlug);
  const canAccess = studentHasModuleLiveContent(context, sessions);

  if (!canAccess) {
    return NextResponse.json(
      createApiResponse(true, {
        data: {
          recordings: [],
          progress: getClassProgress(programSlug),
          programSlug,
        },
      })
    );
  }

  const [allRecordings, progress] = await Promise.all([
    getClassRecordings(programSlug),
    Promise.resolve(getClassProgress(programSlug)),
  ]);
  const recordings = filterByStudentModule(allRecordings, context, (item) => item.level);

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
