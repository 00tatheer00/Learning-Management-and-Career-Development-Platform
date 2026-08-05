import { prisma } from "@/lib/prisma";
import { resolveTrainerIdForProgram, normalizeProgramSlug } from "@/lib/auth/program-assignment";

/**
 * Synchronizes and automatically assigns trainers to all students who have approved enrollments.
 * Ensures that whenever a student enrollment is approved, the student user account is linked
 * to the correct active trainer for that course and phase/module.
 */
export async function syncApprovedStudentsTrainerAssignments(): Promise<number> {
  try {
    // 1. Fetch all approved enrollment records sorted by newest first
    const approvedEnrollments = await prisma.enrollment.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        program: true,
        level: true,
        batch: true,
      },
    });

    if (approvedEnrollments.length === 0) return 0;

    let updatedCount = 0;

    // Cache resolved trainer IDs per programSlug to minimize DB lookups
    const trainerCache = new Map<string, string | undefined>();

    for (const enrollment of approvedEnrollments) {
      if (!enrollment.email) continue;
      const emailLower = enrollment.email.trim().toLowerCase();

      // Find student user record
      const student = await prisma.user.findUnique({
        where: { email: emailLower },
        select: {
          id: true,
          role: true,
          programSlug: true,
          level: true,
          batch: true,
          trainerId: true,
        },
      });

      if (!student || student.role !== "student") continue;

      const programSlug = normalizeProgramSlug(enrollment.program);
      if (!trainerCache.has(programSlug)) {
        const resolvedId = await resolveTrainerIdForProgram(programSlug);
        trainerCache.set(programSlug, resolvedId);
      }
      const targetTrainerId = trainerCache.get(programSlug);

      // Check if student user needs trainerId, programSlug, level, or batch updated
      const needsTrainerUpdate = Boolean(targetTrainerId && student.trainerId !== targetTrainerId);
      const needsProgramUpdate = Boolean(programSlug && student.programSlug !== programSlug);
      const needsLevelUpdate = Boolean(enrollment.level && student.level !== enrollment.level);
      const needsBatchUpdate = Boolean(enrollment.batch && student.batch !== enrollment.batch);

      if (needsTrainerUpdate || needsProgramUpdate || needsLevelUpdate || needsBatchUpdate) {
        await prisma.user.update({
          where: { id: student.id },
          data: {
            ...(targetTrainerId ? { trainerId: targetTrainerId } : {}),
            ...(needsProgramUpdate ? { programSlug } : {}),
            ...(enrollment.level ? { level: enrollment.level } : {}),
            ...(enrollment.batch ? { batch: enrollment.batch } : {}),
          },
        });
        updatedCount++;
      }
    }

    return updatedCount;
  } catch (error) {
    console.error("Error in syncApprovedStudentsTrainerAssignments:", error);
    return 0;
  }
}
