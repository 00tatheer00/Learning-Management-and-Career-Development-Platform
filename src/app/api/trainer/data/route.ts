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
import { getUsersByRole } from "@/lib/auth/users";
import {
  getAssignments,
  getLiveSessions,
  getSubmissions,
} from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { isPortalVideoAvailable } from "@/lib/portal-video/config";

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

    const [allStudents, allAssignments, allSessions, allSubmissions] = await Promise.all([
      getUsersByRole("student"),
      getAssignments(programSlug),
      getLiveSessions(programSlug),
      getSubmissions(),
    ]);

    const assignments = allAssignments.filter((a) => a.trainerId === trainerId);
    const assignmentIds = new Set(assignments.map((a) => a.id));
    const students = filterStudentsByProgram(allStudents, programSlug);
    const sessions = filterByTrainerProgram(allSessions, programSlug).filter(
      (s) => s.trainerId === trainerId
    );
    const submissions = allSubmissions.filter((s) => assignmentIds.has(s.assignmentId));

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          assignments,
          sessions,
          submissions,
          students,
          trainer: {
            programSlug,
            courseTitle: getTrainerCourseTitle(programSlug),
            designation: getTrainerDesignation(programSlug),
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
