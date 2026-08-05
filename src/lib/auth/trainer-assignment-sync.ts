import { prisma } from "@/lib/prisma";
import { resolveTrainerIdForProgram, normalizeProgramSlug } from "@/lib/auth/program-assignment";

let lastSyncTimestamp = 0;
const SYNC_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Synchronizes and automatically assigns trainers to all students who have approved enrollments.
 * Optimized for maximum performance:
 * 1. Throttles execution so it runs at most once every 5 minutes.
 * 2. Uses bulk database queries (1 query for all students) instead of N+1 sequential lookups.
 * 3. Batch updates only modified student records in parallel.
 */
export async function syncApprovedStudentsTrainerAssignments(force = false): Promise<number> {
  const now = Date.now();
  if (!force && now - lastSyncTimestamp < SYNC_THROTTLE_MS) {
    return 0;
  }
  lastSyncTimestamp = now;

  try {
    // 1. Bulk fetch all approved enrollments and all student users in parallel (2 fast queries)
    const [approvedEnrollments, allStudents] = await Promise.all([
      prisma.enrollment.findMany({
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
        select: {
          email: true,
          program: true,
          level: true,
          batch: true,
        },
      }),
      prisma.user.findMany({
        where: { role: "student" },
        select: {
          id: true,
          email: true,
          programSlug: true,
          level: true,
          batch: true,
          trainerId: true,
        },
      }),
    ]);

    if (approvedEnrollments.length === 0 || allStudents.length === 0) return 0;

    // Build fast in-memory map of students by normalized email
    const studentMap = new Map(allStudents.map((s) => [s.email.trim().toLowerCase(), s]));
    const trainerCache = new Map<string, string | undefined>();

    const updatePromises: Promise<unknown>[] = [];
    const processedEmails = new Set<string>();

    for (const enrollment of approvedEnrollments) {
      if (!enrollment.email) continue;
      const emailLower = enrollment.email.trim().toLowerCase();
      if (processedEmails.has(emailLower)) continue; // process latest approved enrollment per student
      processedEmails.add(emailLower);

      const student = studentMap.get(emailLower);
      if (!student) continue;

      const programSlug = normalizeProgramSlug(enrollment.program);
      if (!trainerCache.has(programSlug)) {
        const resolvedId = await resolveTrainerIdForProgram(programSlug);
        trainerCache.set(programSlug, resolvedId);
      }
      const targetTrainerId = trainerCache.get(programSlug);

      const needsTrainerUpdate = Boolean(targetTrainerId && student.trainerId !== targetTrainerId);
      const needsProgramUpdate = Boolean(programSlug && student.programSlug !== programSlug);
      const needsLevelUpdate = Boolean(enrollment.level && student.level !== enrollment.level);
      const needsBatchUpdate = Boolean(enrollment.batch && student.batch !== enrollment.batch);

      if (needsTrainerUpdate || needsProgramUpdate || needsLevelUpdate || needsBatchUpdate) {
        updatePromises.push(
          prisma.user.update({
            where: { id: student.id },
            data: {
              ...(targetTrainerId ? { trainerId: targetTrainerId } : {}),
              ...(needsProgramUpdate ? { programSlug } : {}),
              ...(enrollment.level ? { level: enrollment.level } : {}),
              ...(enrollment.batch ? { batch: enrollment.batch } : {}),
            },
          })
        );
      }
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    return updatePromises.length;
  } catch (error) {
    console.error("Error in syncApprovedStudentsTrainerAssignments:", error);
    return 0;
  }
}
