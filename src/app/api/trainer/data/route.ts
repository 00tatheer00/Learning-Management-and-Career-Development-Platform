import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  filterByTrainerProgram,
  filterStudentsByProgram,
  getTrainerCourseTitle,
  getTrainerDesignation,
  requireTrainerProgram,
  resolveTrainerId,
} from "@/lib/auth/trainer-scope";
import { getProgramModuleNames } from "@/lib/modules/student-module-access";
import { getUsersByRole } from "@/lib/auth/users";
import {
  getAssignments,
  getLiveSessions,
  getSubmissions,
} from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { isPortalVideoAvailable } from "@/lib/portal-video/config";

import { syncApprovedStudentsTrainerAssignments } from "@/lib/auth/trainer-assignment-sync";
import { getTrainerApprovedStudents } from "@/lib/api/trainer-students-sync";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const programSlug = requireTrainerProgram(user);
    const trainerId = resolveTrainerId(user);

    void syncApprovedStudentsTrainerAssignments().catch((err) => {
      console.error("Background sync error:", err);
    });

    const [students, allAssignments, allSessions, allSubmissions] = await Promise.all([
      getTrainerApprovedStudents(programSlug),
      getAssignments(programSlug),
      getLiveSessions(programSlug),
      getSubmissions(),
    ]);

    const assignments = allAssignments.filter((a) => a.trainerId === trainerId);
    const sessions = filterByTrainerProgram(allSessions, programSlug).filter(
      (s) => s.trainerId === trainerId
    );

    const activeLevel = user.level?.trim();
    const isAll = !activeLevel || activeLevel === "all";

    const scopedAssignments = isAll
      ? assignments
      : assignments.filter((a) => !a.level || a.level === activeLevel);

    const scopedSessions = isAll
      ? sessions
      : sessions.filter((s) => !s.level || s.level === activeLevel);

    const scopedStudents = isAll
      ? students
      : students.filter((st) => st.level === activeLevel);

    const scopedAssignmentIds = new Set(scopedAssignments.map((a) => a.id));
    const scopedSubmissions = allSubmissions.filter((s) => scopedAssignmentIds.has(s.assignmentId));

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          assignments: scopedAssignments,
          sessions: scopedSessions,
          submissions: scopedSubmissions,
          students: scopedStudents,
          trainer: {
            programSlug,
            courseTitle: getTrainerCourseTitle(programSlug),
            designation: getTrainerDesignation(programSlug),
            modules: getProgramModuleNames(programSlug),
            currentLevel: user.level ?? null,
          },
          portalVideoEnabled: isPortalVideoAvailable(),
        },
      })
    );
  } catch {
    return NextResponse.json(
      createApiResponse(false, { error: "Trainer course not configured" }),
      { status: 400 }
    );
  }
}
