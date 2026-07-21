import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssignments, getSubmissions } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  filterByStudentModule,
} from "@/lib/modules/student-module-content";
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
  const programSlugs = getStudentPortalProgramSlugs(user);
  const [allAssignments, submissions] = await Promise.all([
    fetchMergedByProgram(programSlugs, getAssignments),
    getSubmissions(user.id),
  ]);

  const assignments = filterByStudentModule(allAssignments, context, (item) => item.level);
  const assignmentIds = new Set(assignments.map((item) => item.id));
  const filteredSubmissions = submissions.filter((item) => assignmentIds.has(item.assignmentId));

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        assignments,
        submissions: filteredSubmissions,
        programSlug: user.programSlug,
      },
    })
  );
}
