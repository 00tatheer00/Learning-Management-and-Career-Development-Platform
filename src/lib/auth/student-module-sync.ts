import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getProgramModuleNames,
  resolveActiveStudentModule,
} from "@/lib/modules/student-module-access";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import { DEMO_STUDENT_PROGRAM_SLUGS } from "@/lib/student-portal/program-scope";

export async function getApprovedEnrollmentLevels(
  email: string,
  programSlug: string
): Promise<string[]> {
  if (isDemoPortalStudent(email)) {
    return DEMO_STUDENT_PROGRAM_SLUGS.flatMap((slug) => getProgramModuleNames(slug));
  }

  const rows = await prisma.enrollment.findMany({
    where: {
      email: email.trim().toLowerCase(),
      program: programSlug,
      status: "approved",
    },
    select: { level: true },
  });

  const order = getProgramModuleNames(programSlug);
  const levels = new Set(rows.map((row) => row.level.trim()).filter(Boolean));
  return order.filter((moduleName) => levels.has(moduleName));
}

export async function syncStudentActiveModuleFromEnrollments(
  userId: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true, programSlug: true, level: true },
  });

  if (!user?.programSlug || user.role !== "student") {
    return user?.level ?? null;
  }

  const approvedLevels = await getApprovedEnrollmentLevels(user.email, user.programSlug);
  if (approvedLevels.length === 0) {
    return user.level;
  }

  const activeModule = resolveActiveStudentModule(
    user.programSlug,
    user.level,
    approvedLevels
  );

  if (!activeModule || activeModule === user.level) {
    return user.level;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { level: activeModule },
  });

  return activeModule;
}
