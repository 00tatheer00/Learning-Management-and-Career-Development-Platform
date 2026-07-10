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

async function resolveDemoStudentUserId(): Promise<string | null> {
  const byEmail = await prisma.user.findUnique({
    where: { email: DEMO_PORTAL_STUDENT_EMAIL.toLowerCase() },
    select: { id: true, role: true },
  });
  if (byEmail?.role === "student") return byEmail.id;

  const byId = await prisma.user.findUnique({
    where: { id: DEMO_STUDENT_USER_ID },
    select: { id: true, role: true },
  });
  if (byId?.role === "student") return byId.id;

  return null;
}

/**
 * Ensures demo student exists for Portal Logins when seed was not run on production.
 * Never throws — logs and returns so Portal Logins still loads for real students.
 */
export async function ensureDemoStudentForPortalLogins(): Promise<string | null> {
  try {
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
    const demoEmail = DEMO_PORTAL_STUDENT_EMAIL.toLowerCase();

    const studentFields = {
      name: "Demo Student",
      role: "student" as const,
      programSlug: "web-development",
      level: primaryLevel,
      batch: "Batch 1",
      avatarInitials: "DS",
      isActive: true,
      phone: "03001234567",
      passwordHash,
    };

    const existingById = await prisma.user.findUnique({
      where: { id: DEMO_STUDENT_USER_ID },
      select: { id: true, email: true },
    });
    const existingByEmail = await prisma.user.findUnique({
      where: { email: demoEmail },
      select: { id: true },
    });

    let demoUserId: string;

    if (existingByEmail) {
      demoUserId = existingByEmail.id;
      await prisma.user.update({
        where: { id: demoUserId },
        data: studentFields,
      });
    } else if (existingById) {
      demoUserId = existingById.id;
      await prisma.user.update({
        where: { id: demoUserId },
        data: { ...studentFields, email: demoEmail },
      });
    } else {
      demoUserId = DEMO_STUDENT_USER_ID;
      await prisma.user.create({
        data: {
          id: demoUserId,
          email: demoEmail,
          ...studentFields,
        },
      });
    }

    await prisma.enrollment.upsert({
      where: { id: DEMO_PRIMARY_ENROLLMENT_ID },
      create: {
        id: DEMO_PRIMARY_ENROLLMENT_ID,
        fullName: "Demo Student",
        fatherName: "Demo Father",
        institution: "EEST",
        classSemester: "N/A",
        cnic: "4210112345671",
        email: demoEmail,
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
        email: demoEmail,
        fullName: "Demo Student",
        level: primaryLevel,
        status: "approved",
        reviewedAt,
        reviewedBy: "admin-1",
        ...(portalPasswordEnc ? { portalPasswordEnc } : {}),
      },
    });

    return demoUserId;
  } catch (error) {
    console.error("[demo-student] ensureDemoStudentForPortalLogins failed:", error);
    return resolveDemoStudentUserId();
  }
}

export { isDemoPortalStudent };
