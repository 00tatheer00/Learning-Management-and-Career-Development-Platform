import { hashPassword } from "@/lib/auth/password";
import { encryptPortalPassword } from "@/lib/auth/portal-password-vault";
import {
  DEMO_PORTAL_STUDENT_EMAIL,
  isDemoEnrollment,
  isDemoPortalStudent,
} from "@/lib/constants/demo-student";
import { getProgramModuleNames } from "@/lib/modules/student-module-access";
import { prisma } from "@/lib/prisma";

export const DEMO_STUDENT_USER_ID = "student-1";
export const DEMO_PRIMARY_ENROLLMENT_ID = "enrollment-demo-web-1";

/** One Portal Logins row per demo account (primary module enrollment). */
export function isPrimaryDemoEnrollment(row: {
  id?: string | null;
  email?: string | null;
}): boolean {
  if (!isDemoEnrollment(row)) return false;
  return row.id === DEMO_PRIMARY_ENROLLMENT_ID;
}

/**
 * Ensures demo student exists for Portal Logins when seed was not run on production.
 */
export async function ensureDemoStudentForPortalLogins(): Promise<void> {
  const modules = getProgramModuleNames("web-development");
  const primaryLevel = modules[0] ?? "HTML & CSS";
  const demoPassword = process.env.SEED_STUDENT_PASSWORD?.trim() || "student123";

  let portalPasswordEnc: string | undefined;
  try {
    portalPasswordEnc = encryptPortalPassword(demoPassword);
  } catch {
    portalPasswordEnc = undefined;
  }

  const passwordHash = await hashPassword(demoPassword);
  const reviewedAt = new Date();

  await prisma.user.upsert({
    where: { email: DEMO_PORTAL_STUDENT_EMAIL },
    create: {
      id: DEMO_STUDENT_USER_ID,
      email: DEMO_PORTAL_STUDENT_EMAIL,
      passwordHash,
      role: "student",
      name: "Demo Student",
      phone: "03001234567",
      programSlug: "web-development",
      level: primaryLevel,
      batch: "Batch 1",
      avatarInitials: "DS",
      isActive: true,
    },
    update: {
      name: "Demo Student",
      role: "student",
      programSlug: "web-development",
      level: primaryLevel,
      isActive: true,
    },
  });

  await prisma.enrollment.upsert({
    where: { id: DEMO_PRIMARY_ENROLLMENT_ID },
    create: {
      id: DEMO_PRIMARY_ENROLLMENT_ID,
      fullName: "Demo Student",
      fatherName: "Demo Father",
      institution: "EEST",
      classSemester: "N/A",
      cnic: "4210112345671",
      email: DEMO_PORTAL_STUDENT_EMAIL,
      whatsapp: "03001234567",
      fieldOfStudy: "Computer Science",
      program: "web-development",
      level: primaryLevel,
      batch: "Batch 1",
      learningMode: "online",
      hasLaptop: "yes",
      internetAvailable: "yes",
      confirmInfoCorrect: true,
      agreeToPolicies: true,
      portalPasswordEnc,
      status: "approved",
      reviewedAt,
      reviewedBy: "admin-1",
    },
    update: {
      email: DEMO_PORTAL_STUDENT_EMAIL,
      fullName: "Demo Student",
      level: primaryLevel,
      status: "approved",
      reviewedAt,
      reviewedBy: "admin-1",
      ...(portalPasswordEnc ? { portalPasswordEnc } : {}),
    },
  });
}

export { isDemoPortalStudent };
