import "server-only";

import { prisma } from "@/lib/prisma";
import type { PortalUser } from "@/types/portal";
import { getStudentClassSchedule } from "@/lib/constants/student-portal-ur";

export interface StudentContextData {
  name: string;
  role: string;
  programSlug?: string;
  activeLevel?: string;
  approvedLevels: string[];
  assignmentsSummary?: string;
  attendanceSummary?: string;
  scheduleSummary?: string;
}

/**
 * Safely fetches authorized, isolated student portal context.
 * Strict Rule: Only queries records for the given student (user.id & user.email).
 * Never bypasses module isolation.
 */
export async function getAuthorizedStudentContext(
  user: PortalUser
): Promise<StudentContextData | null> {
  if (user.role !== "student") {
    return {
      name: user.name,
      role: user.role,
      programSlug: user.programSlug,
      approvedLevels: user.approvedLevels || [],
    };
  }

  try {
    const approvedLevels = user.approvedLevels || (user.level ? [user.level] : []);

    // 1. Fetch student's own recent submissions (limit 5)
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: user.id },
      select: {
        id: true,
        assignmentId: true,
        status: true,
        marks: true,
        submittedAt: true,
        assignment: {
          select: {
            title: true,
            dueDate: true,
            level: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    });

    const submissionsText =
      submissions.length > 0
        ? submissions
            .map(
              (s) =>
                `- ${s.assignment.title}: Status: ${s.status}${
                  s.marks !== null && s.marks !== undefined ? `, Marks: ${s.marks}` : ""
                }`
            )
            .join("\n")
        : "No submissions recorded yet.";

    // 2. Fetch student's own attendance count
    const attendanceCount = await prisma.classAttendance.count({
      where: { studentId: user.id },
    });

    // 3. Current program class schedule
    const schedule = getStudentClassSchedule(user.programSlug);
    const scheduleText = `${schedule.programLabel}: ${schedule.daysLabel}. ${schedule.subline}`;

    return {
      name: user.name,
      role: "student",
      programSlug: user.programSlug,
      activeLevel: user.level,
      approvedLevels,
      assignmentsSummary: submissionsText,
      attendanceSummary: `Classes attended: ${attendanceCount}`,
      scheduleSummary: scheduleText,
    };
  } catch (error) {
    console.error("[AIChat] Failed to load student context:", error);
    return {
      name: user.name,
      role: "student",
      programSlug: user.programSlug,
      activeLevel: user.level,
      approvedLevels: user.approvedLevels || [],
    };
  }
}
