import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";
import type { EnrollmentStatus } from "@/types/portal";

export interface ApplicantApplicationSummary {
  id: string;
  courseTitle: string;
  program: string;
  level: string;
  status: EnrollmentStatus;
  appliedAt: string;
  paymentScreenshot?: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeCnic(cnic: string) {
  return cnic.replace(/[-\s]/g, "");
}

export function applicantMatches(
  a: { email: string; cnic: string },
  b: { email: string; cnic: string }
): boolean {
  return (
    normalizeEmail(a.email) === normalizeEmail(b.email) ||
    normalizeCnic(a.cnic) === normalizeCnic(b.cnic)
  );
}

export async function findApplicantEnrollments(
  email: string,
  cnic: string,
  excludeId?: string
) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedCnic = normalizeCnic(cnic);

  return prisma.enrollment.findMany({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [{ email: normalizedEmail }, { cnic: normalizedCnic }],
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      cnic: true,
      whatsapp: true,
      program: true,
      level: true,
      status: true,
      createdAt: true,
      paymentScreenshot: true,
    },
  });
}

export function mapApplicationSummaries(
  records: Array<{
    id: string;
    program: string;
    level: string;
    status: EnrollmentStatus;
    createdAt: Date;
    paymentScreenshot: string | null;
  }>
): ApplicantApplicationSummary[] {
  return records.map((record) => ({
    id: record.id,
    courseTitle: getProgramBySlug(record.program)?.title ?? record.program,
    program: record.program,
    level: record.level,
    status: record.status,
    appliedAt: record.createdAt.toISOString(),
    paymentScreenshot: record.paymentScreenshot ?? undefined,
  }));
}

export function getApplicationNumber<
  T extends { id: string; email: string; cnic: string; createdAt: string | Date }
>(target: T, related: T[]): number {
  const sorted = [...related].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const index = sorted.findIndex((item) => item.id === target.id);
  return index >= 0 ? index + 1 : 1;
}

export function enrichRowsWithApplicationMeta<
  T extends {
    id: string;
    email: string;
    cnic: string;
    createdAt: string;
    courseTitle: string;
    program: string;
    level: string;
    status: EnrollmentStatus;
    paymentScreenshot?: string;
  },
>(rows: T[]) {
  return rows.map((row) => {
    const related = rows
      .filter((item) => applicantMatches(row, item))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const applicationNumber = getApplicationNumber(row, related);
    const previousApplications: ApplicantApplicationSummary[] = related
      .filter((item) => item.id !== row.id)
      .map((item) => ({
        id: item.id,
        courseTitle: item.courseTitle,
        program: item.program,
        level: item.level,
        status: item.status,
        appliedAt: item.createdAt,
        paymentScreenshot: item.paymentScreenshot,
      }))
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

    return {
      ...row,
      applicationNumber,
      totalApplications: related.length,
      isReturningApplicant: applicationNumber > 1,
      previousApplications,
    };
  });
}
