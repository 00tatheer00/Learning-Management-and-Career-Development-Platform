import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";
import { getProgramModuleNames } from "@/lib/modules/student-module-access";

export interface PendingPortalWelcome {
  enrollmentId: string;
  moduleName: string;
  courseTitle: string;
  programSlug: string;
}

export async function getPendingPortalWelcome(
  email: string,
  programSlug?: string | null
): Promise<PendingPortalWelcome | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const enrollments = await prisma.enrollment.findMany({
    where: {
      status: "approved",
      portalWelcomeShownAt: null,
      ...(programSlug ? { program: programSlug } : {}),
    },
    select: {
      id: true,
      email: true,
      program: true,
      level: true,
      reviewedAt: true,
      createdAt: true,
    },
  });

  const pending = enrollments.filter(
    (enrollment) => enrollment.email.trim().toLowerCase() === normalizedEmail
  );

  if (pending.length === 0) return null;

  const sorted = [...pending].sort((a, b) => {
    const order = getProgramModuleNames(a.program);
    const moduleDiff = order.indexOf(a.level) - order.indexOf(b.level);
    if (moduleDiff !== 0) return moduleDiff;
    const aTime = a.reviewedAt ?? a.createdAt;
    const bTime = b.reviewedAt ?? b.createdAt;
    return aTime.getTime() - bTime.getTime();
  });

  const next = sorted[0];
  return {
    enrollmentId: next.id,
    moduleName: next.level,
    courseTitle: getProgramBySlug(next.program)?.title ?? next.program,
    programSlug: next.program,
  };
}

export async function markPortalWelcomeShown(
  email: string,
  enrollmentId: string
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { email: true, status: true },
  });

  if (
    !enrollment ||
    enrollment.status !== "approved" ||
    enrollment.email.trim().toLowerCase() !== normalizedEmail
  ) {
    return false;
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { portalWelcomeShownAt: new Date() },
  });

  return true;
}

export async function resetPortalWelcomeForEnrollment(enrollmentId: string): Promise<void> {
  try {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { portalWelcomeShownAt: null },
    });
  } catch {
    // Field or enrollment may be unavailable during rollout — ignore.
  }
}
