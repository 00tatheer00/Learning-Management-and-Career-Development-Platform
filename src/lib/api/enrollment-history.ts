import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";
import type { EnrollmentStatus } from "@/types/portal";

export interface ApplicantApplicationSummary {
  id: string;
  fullName?: string;
  courseTitle: string;
  program: string;
  level: string;
  status: EnrollmentStatus;
  appliedAt: string;
  hasPaymentScreenshot?: boolean;
}

export type DuplicateMatchField = "email" | "cnic" | "both" | null;

export interface DuplicateMatchInfo {
  field: DuplicateMatchField;
  label: string;
  hasApprovedMatch: boolean;
  hasPendingMatch: boolean;
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
  }>,
  options?: { includePaymentScreenshots?: boolean }
): ApplicantApplicationSummary[] {
  const includePaymentScreenshots = options?.includePaymentScreenshots ?? false;

  return records.map((record) => ({
    id: record.id,
    courseTitle: getProgramBySlug(record.program)?.title ?? record.program,
    program: record.program,
    level: record.level,
    status: record.status,
    appliedAt: record.createdAt.toISOString(),
    ...(includePaymentScreenshots && record.paymentScreenshot
      ? { paymentScreenshot: record.paymentScreenshot }
      : {}),
  }));
}

export function getDuplicateMatchInfo<
  T extends {
    id: string;
    fullName: string;
    email: string;
    cnic: string;
    status: EnrollmentStatus;
  }
>(row: T, related: T[]): DuplicateMatchInfo | null {
  const others = related.filter((item) => item.id !== row.id);
  if (others.length === 0) return null;

  const emailMatch = others.some(
    (item) => normalizeEmail(item.email) === normalizeEmail(row.email)
  );
  const cnicMatch = others.some(
    (item) => normalizeCnic(item.cnic) === normalizeCnic(row.cnic)
  );

  if (!emailMatch && !cnicMatch) return null;

  const field: DuplicateMatchField =
    emailMatch && cnicMatch ? "both" : emailMatch ? "email" : "cnic";

  const hasApprovedMatch = others.some((item) => item.status === "approved");
  const hasPendingMatch = others.some((item) => item.status === "pending");
  const matchName = others[0]?.fullName ?? "another applicant";

  const fieldLabel =
    field === "both" ? "Same email & CNIC" : field === "email" ? "Same email" : "Same CNIC";

  const statusLabel = hasApprovedMatch
    ? "as approved student"
    : hasPendingMatch
      ? "as pending registration"
      : "as previous applicant";

  return {
    field,
    label: `${fieldLabel} ${statusLabel}: ${matchName}`,
    hasApprovedMatch,
    hasPendingMatch,
  };
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
    fullName: string;
    email: string;
    cnic: string;
    createdAt: string;
    status: EnrollmentStatus;
    courseTitle: string;
    program: string;
    level: string;
    paymentScreenshot?: string;
    hasPaymentScreenshot?: boolean;
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
        fullName: "fullName" in item ? (item as { fullName: string }).fullName : undefined,
        courseTitle: item.courseTitle,
        program: item.program,
        level: item.level,
        status: item.status,
        appliedAt: item.createdAt,
        hasPaymentScreenshot: Boolean(
          item.hasPaymentScreenshot || item.paymentScreenshot?.startsWith("http")
        ),
      }))
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

    const duplicateMatch = getDuplicateMatchInfo(row, related);

    return {
      ...row,
      applicationNumber,
      totalApplications: related.length,
      isReturningApplicant: applicationNumber > 1,
      previousApplications,
      duplicateMatch,
    };
  });
}
