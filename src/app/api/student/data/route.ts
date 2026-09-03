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
  const programSlugs = await getStudentPortalProgramSlugs(user);
  const [allAssignments, submissions] = await Promise.all([
    fetchMergedByProgram(programSlugs, getAssignments),
    getSubmissions(user.id),
  ]);

  const submittedAssignmentIds = new Set(submissions.map((s) => s.assignmentId));
  const moduleFilteredAssignments = filterByStudentModule(
    allAssignments,
    context,
    (item) => item.level,
    (item) => item.programSlug
  );
  // Guarantee that any assignment the student has already submitted to is visible along with module assignments
  const visibleAssignmentMap = new Map<string, typeof allAssignments[0]>();
  for (const a of moduleFilteredAssignments) {
    visibleAssignmentMap.set(a.id, a);
  }
  for (const a of allAssignments) {
    if (submittedAssignmentIds.has(a.id)) {
      visibleAssignmentMap.set(a.id, a);
    }
  }
  const assignments = Array.from(visibleAssignmentMap.values());

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        assignments,
        submissions,
        programSlug: user.programSlug,
        level: user.level,
      },
    })
  );
}
