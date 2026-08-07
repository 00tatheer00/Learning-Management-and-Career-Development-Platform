import { prisma } from "@/lib/prisma";
import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";

export interface RecordModuleEnrollmentInput {
  email: string;
  programSlug: string;
  moduleName: string;
  studentId?: string | null;
  enrollmentId?: string | null;
  status?: string;
}

export interface StudentModuleEnrollmentRecord {
  id: string;
  studentId: string | null;
  enrollmentId: string | null;
  email: string;
  programSlug: string;
  moduleName: string;
  status: string;
  enrolledAt: Date;
  unlockedAt: Date;
}

/**
 * Additively records or updates a ModuleEnrollment record without disrupting existing flows.
 */
export async function recordModuleEnrollment(
  input: RecordModuleEnrollmentInput
): Promise<StudentModuleEnrollmentRecord | null> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedSlug = input.programSlug.trim().toLowerCase();
  const normalizedModule = input.moduleName.trim();

  if (!normalizedEmail || !normalizedSlug || !normalizedModule) {
    return null;
  }

  const id = `mod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    const record = await prisma.moduleEnrollment.upsert({
      where: {
        email_programSlug_moduleName: {
          email: normalizedEmail,
          programSlug: normalizedSlug,
          moduleName: normalizedModule,
        },
      },
      create: {
        id,
        email: normalizedEmail,
        programSlug: normalizedSlug,
        moduleName: normalizedModule,
        studentId: input.studentId ?? undefined,
        enrollmentId: input.enrollmentId ?? undefined,
        status: input.status ?? "active",
      },
      update: {
        studentId: input.studentId ?? undefined,
        enrollmentId: input.enrollmentId ?? undefined,
        status: input.status ?? "active",
      },
    });

    return {
      id: record.id,
      studentId: record.studentId,
      enrollmentId: record.enrollmentId,
      email: record.email,
      programSlug: record.programSlug,
      moduleName: record.moduleName,
      status: record.status,
      enrolledAt: record.enrolledAt,
      unlockedAt: record.unlockedAt,
    };
  } catch (error) {
    console.warn("ModuleEnrollment additive record failed gracefully:", error);
    return null;
  }
}

/**
 * Returns student module enrollments with graceful fallback to approved Enrollment rows for full backward compatibility.
 */
export async function getStudentModuleEnrollments(
  email: string,
  programSlug: string
): Promise<Array<{ moduleName: string; programSlug: string; source: "module_enrollment" | "enrollment_fallback" }>> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedSlug = programSlug.trim().toLowerCase();

  try {
    const existing = await prisma.moduleEnrollment.findMany({
      where: {
        email: normalizedEmail,
        programSlug: normalizedSlug,
      },
      orderBy: { enrolledAt: "asc" },
    });

    if (existing.length > 0) {
      return existing.map((row) => ({
        moduleName: row.moduleName,
        programSlug: row.programSlug,
        source: "module_enrollment" as const,
      }));
    }
  } catch {
    // Fall back gracefully if table query encounters issue
  }

  // Backward compatibility fallback to approved Enrollment records
  const fallbackLevels = await getApprovedEnrollmentLevels(normalizedEmail, normalizedSlug);
  return fallbackLevels.map((lvl) => ({
    moduleName: lvl,
    programSlug: normalizedSlug,
    source: "enrollment_fallback" as const,
  }));
}
