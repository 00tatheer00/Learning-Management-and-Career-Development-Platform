import { prisma } from "@/lib/prisma";
import { normalizeProgramSlug } from "@/lib/auth/program-assignment";
import { DEFAULT_BATCH_NAME } from "@/lib/constants/batch";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";

export interface ApprovedTrainerStudent {
  id: string;
  enrollmentId?: string;
  name: string;
  email: string;
  phone?: string;
  level: string;
  batch: string;
  programSlug: string;
  status: "approved";
  createdAt: string;
  avatarUrl?: string;
  avatarInitials?: string;
}

/**
 * Returns all approved students for a trainer's course directly synced with Admin Approved Enrollments.
 * Guarantees 1-to-1 exact data alignment between Admin Portal and Trainer Portal.
 */
export async function getTrainerApprovedStudents(
  programSlug: string
): Promise<ApprovedTrainerStudent[]> {
  try {
    const targetSlug = normalizeProgramSlug(programSlug);

    // 1. Fetch all approved enrollment records from DB
    const [enrollments, userAccounts] = await Promise.all([
      prisma.enrollment.findMany({
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "student", isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatarUrl: true,
          avatarInitials: true,
          programSlug: true,
          level: true,
        },
      }),
    ]);

    // Fast in-memory lookup for user accounts by email
    const userMap = new Map(userAccounts.map((u) => [u.email.trim().toLowerCase(), u]));

    // Filter enrollments belonging explicitly to the target course program
    const matchingEnrollments = enrollments.filter((e) => {
      if (!e.email || isDemoPortalStudent(e.email)) return false;
      if (!e.program || !e.program.trim()) return false;
      return normalizeProgramSlug(e.program) === targetSlug;
    });

    const studentList: ApprovedTrainerStudent[] = [];
    const processedEmails = new Set<string>();

    for (const enrollment of matchingEnrollments) {
      const emailLower = enrollment.email.trim().toLowerCase();
      if (processedEmails.has(emailLower)) continue; // deduplicate multiple approved enrollments
      processedEmails.add(emailLower);

      const userAccount = userMap.get(emailLower);

      studentList.push({
        id: userAccount?.id ?? enrollment.id,
        enrollmentId: enrollment.id,
        name: userAccount?.name || enrollment.fullName,
        email: enrollment.email,
        phone: userAccount?.phone || enrollment.whatsapp || undefined,
        level: enrollment.level || "HTML & CSS",
        batch: enrollment.batch || DEFAULT_BATCH_NAME,
        programSlug: targetSlug,
        status: "approved",
        createdAt: enrollment.createdAt.toISOString(),
        avatarUrl: userAccount?.avatarUrl ?? undefined,
        avatarInitials: userAccount?.avatarInitials ?? undefined,
      });
    }

    return studentList;
  } catch (error) {
    console.error("Error in getTrainerApprovedStudents:", error);
    return [];
  }
}
