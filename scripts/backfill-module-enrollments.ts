/**
 * Safe, idempotent migration script to populate ModuleEnrollment records
 * for existing approved Enrollment records in MongoDB without data loss.
 *
 * Run: npm run db:backfill-modules
 */
import { prisma } from "../src/lib/prisma";
import { recordModuleEnrollment } from "../src/lib/services/module-enrollment-service";

export async function runModuleEnrollmentsBackfill() {
  console.log("Starting safe ModuleEnrollment backfill...");

  const approvedEnrollments = await prisma.enrollment.findMany({
    where: { status: "approved" },
    select: {
      id: true,
      email: true,
      program: true,
      level: true,
      reviewedAt: true,
      createdAt: true,
    },
  });

  console.log(`Found ${approvedEnrollments.length} approved enrollment records.`);

  if (approvedEnrollments.length === 0) {
    console.log("No approved enrollments to backfill.");
    return { total: 0, processed: 0, createdOrUpdated: 0 };
  }

  const emails = Array.from(
    new Set(approvedEnrollments.map((e) => e.email.trim().toLowerCase()))
  );

  const studentUsers = await prisma.user.findMany({
    where: {
      role: "student",
      email: { in: emails },
    },
    select: { id: true, email: true },
  });

  const studentIdByEmail = new Map(
    studentUsers.map((user) => [user.email.trim().toLowerCase(), user.id])
  );

  let createdOrUpdated = 0;

  for (const enrollment of approvedEnrollments) {
    const studentId = studentIdByEmail.get(enrollment.email.trim().toLowerCase()) ?? null;

    const result = await recordModuleEnrollment({
      email: enrollment.email,
      programSlug: enrollment.program,
      moduleName: enrollment.level,
      studentId,
      enrollmentId: enrollment.id,
      status: "active",
    });

    if (result) {
      createdOrUpdated++;
    }
  }

  console.log(
    `ModuleEnrollment backfill complete: ${createdOrUpdated} of ${approvedEnrollments.length} processed safely.`
  );

  return {
    total: approvedEnrollments.length,
    processed: approvedEnrollments.length,
    createdOrUpdated,
  };
}

if (require.main === module) {
  runModuleEnrollmentsBackfill()
    .catch((error) => {
      console.error("Backfill failed:", error);
      process.exit(1);
    })
    .finally(() => void prisma.$disconnect());
}
