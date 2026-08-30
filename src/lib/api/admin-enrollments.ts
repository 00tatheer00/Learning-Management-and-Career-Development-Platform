import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";
import { DEFAULT_BATCH_NAME, getRegistrationPhase } from "@/lib/constants/batch";
import { formatAppliedDateTime } from "@/lib/utils";
import { enrichRowsWithApplicationMeta } from "@/lib/api/enrollment-history";
import { getPhaseCreatedAtFilter, type PhaseFilter } from "@/lib/services/phase-service";
import type {
  ApplicantApplicationSummary,
  DuplicateMatchInfo,
} from "@/lib/api/enrollment-history";
import type { EnrollmentRecord } from "@/types/portal";

export interface AdminEnrollmentRow extends Omit<EnrollmentRecord, "paymentScreenshot"> {
  courseTitle: string;
  reviewerName?: string;
  applicationNumber: number;
  totalApplications: number;
  isReturningApplicant: boolean;
  previousApplications: ApplicantApplicationSummary[];
  duplicateMatch: DuplicateMatchInfo | null;
  approvalEmailSent?: boolean | null;
  approvalEmailError?: string | null;
  hasPaymentScreenshot: boolean;
}

export async function getAdminEnrollmentRows(options?: {
  phase?: PhaseFilter;
  status?: string;
}): Promise<AdminEnrollmentRow[]> {
  const createdAtFilter = getPhaseCreatedAtFilter(options?.phase);
  const statusFilter =
    options?.status && options.status !== "all"
      ? (options.status as "pending" | "approved" | "rejected")
      : undefined;

  const where: Record<string, unknown> = {};
  if (createdAtFilter) where.createdAt = createdAtFilter;
  if (statusFilter) where.status = statusFilter;

  const records = await prisma.enrollment.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: { createdAt: "desc" },
  });

  const reviewerIds = [
    ...new Set(records.map((record) => record.reviewedBy).filter(Boolean)),
  ] as string[];

  const reviewers =
    reviewerIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: reviewerIds } },
          select: { id: true, name: true },
        })
      : [];

  const reviewerNameById = new Map(reviewers.map((user) => [user.id, user.name]));

  return enrichRowsWithApplicationMeta(
    records.map((record) => ({
      id: record.id,
      fullName: record.fullName,
      fatherName: record.fatherName,
      institution: record.institution,
      classSemester: record.classSemester,
      cnic: record.cnic,
      email: record.email,
      whatsapp: record.whatsapp,
      fieldOfStudy: record.fieldOfStudy,
      program: record.program,
      level: record.level,
      batch: record.batch ?? DEFAULT_BATCH_NAME,
      learningMode: record.learningMode,
      hasLaptop: record.hasLaptop as "yes" | "no",
      internetAvailable: record.internetAvailable as "yes" | "no",
      confirmInfoCorrect: record.confirmInfoCorrect,
      agreeToPolicies: record.agreeToPolicies,
      hasPaymentScreenshot: Boolean(record.paymentScreenshot || record.paymentScreenshotPublicId),
      status: record.status,
      reviewedAt: record.reviewedAt?.toISOString(),
      reviewedBy: record.reviewedBy ?? undefined,
      adminNotes: record.adminNotes ?? undefined,
      approvalEmailSent: record.approvalEmailSent,
      approvalEmailError: record.approvalEmailError ?? undefined,
      createdAt: record.createdAt.toISOString(),
      courseTitle: getProgramBySlug(record.program)?.title ?? record.program,
      reviewerName: record.reviewedBy
        ? reviewerNameById.get(record.reviewedBy) ?? "Admin"
        : undefined,
    }))
  );
}

export async function getAdminEnrollmentPaginated(options?: {
  page?: number;
  limit?: number;
  status?: string;
  phase?: PhaseFilter;
}): Promise<{
  rows: AdminEnrollmentRow[];
  totalCount: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.max(1, Math.min(100, options?.limit ?? 50));
  const skip = (page - 1) * limit;

  const createdAtFilter = getPhaseCreatedAtFilter(options?.phase);
  const statusFilter =
    options?.status && options.status !== "all"
      ? (options.status as "pending" | "approved" | "rejected")
      : undefined;

  const where: Record<string, unknown> = {};
  if (createdAtFilter) where.createdAt = createdAtFilter;
  if (statusFilter) where.status = statusFilter;

  const queryWhere = Object.keys(where).length > 0 ? where : undefined;

  const [records, totalCount] = await Promise.all([
    prisma.enrollment.findMany({
      where: queryWhere,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.enrollment.count({ where: queryWhere }),
  ]);

  const reviewerIds = [
    ...new Set(records.map((record) => record.reviewedBy).filter(Boolean)),
  ] as string[];

  const reviewers =
    reviewerIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: reviewerIds } },
          select: { id: true, name: true },
        })
      : [];

  const reviewerNameById = new Map(reviewers.map((user) => [user.id, user.name]));

  const rows = enrichRowsWithApplicationMeta(
    records.map((record) => ({
      id: record.id,
      fullName: record.fullName,
      fatherName: record.fatherName,
      institution: record.institution,
      classSemester: record.classSemester,
      cnic: record.cnic,
      email: record.email,
      whatsapp: record.whatsapp,
      fieldOfStudy: record.fieldOfStudy,
      program: record.program,
      level: record.level,
      batch: record.batch ?? DEFAULT_BATCH_NAME,
      learningMode: record.learningMode,
      hasLaptop: record.hasLaptop as "yes" | "no",
      internetAvailable: record.internetAvailable as "yes" | "no",
      confirmInfoCorrect: record.confirmInfoCorrect,
      agreeToPolicies: record.agreeToPolicies,
      hasPaymentScreenshot: Boolean(record.paymentScreenshot || record.paymentScreenshotPublicId),
      status: record.status,
      reviewedAt: record.reviewedAt?.toISOString(),
      reviewedBy: record.reviewedBy ?? undefined,
      adminNotes: record.adminNotes ?? undefined,
      approvalEmailSent: record.approvalEmailSent,
      approvalEmailError: record.approvalEmailError ?? undefined,
      createdAt: record.createdAt.toISOString(),
      courseTitle: getProgramBySlug(record.program)?.title ?? record.program,
      reviewerName: record.reviewedBy
        ? reviewerNameById.get(record.reviewedBy) ?? "Admin"
        : undefined,
    }))
  );

  return {
    rows,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit) || 1,
  };
}

function escapeCsv(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildEnrollmentsCsv(rows: AdminEnrollmentRow[]) {
  const headers = [
    "Status",
    "Phase",
    "Name",
    "Father Name",
    "Email",
    "WhatsApp",
    "CNIC",
    "Institution",
    "Class/Semester",
    "Field of Study",
    "Course",
    "Module",
    "Batch",
    "Learning Mode",
    "Laptop",
    "Internet",
    "Applied On",
    "Email Notification",
    "Reviewed On",
    "Reviewed By",
    "Admin Notes",
  ];

  const lines = rows.map((row) => {
    const phaseKey = getRegistrationPhase(row);
    const phaseLabel =
      phaseKey === "phase-1"
        ? "Phase 1 (Module 1)"
        : phaseKey === "phase-2"
          ? "Phase 2 (2nd Module)"
          : "Phase 3 (3rd Module)";

    const emailStatus =
      row.status !== "approved"
        ? "N/A"
        : row.approvalEmailSent
          ? "Delivered"
          : row.approvalEmailError
            ? `Failed (${row.approvalEmailError})`
            : "Pending / Queued";

    return [
      row.status,
      phaseLabel,
      row.fullName,
      row.fatherName,
      row.email,
      row.whatsapp,
      row.cnic,
      row.institution,
      row.classSemester,
      row.fieldOfStudy,
      row.courseTitle,
      row.level,
      row.batch,
      row.learningMode,
      row.hasLaptop,
      row.internetAvailable,
      formatAppliedDateTime(row.createdAt),
      emailStatus,
      row.reviewedAt ? formatAppliedDateTime(row.reviewedAt) : "",
      row.reviewerName ?? "",
      row.adminNotes ?? "",
    ]
      .map(escapeCsv)
      .join(",");
  });

  return `\uFEFF${headers.join(",")}\n${lines.join("\n")}`;
}

export function buildEnrollmentsExportFilename(status?: string, phase?: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  const phaseSuffix = phase && phase !== "all" ? `-${phase}` : "";
  const statusSuffix = status && status !== "all" ? `-${status}` : "";
  return `eest-registrations${phaseSuffix}${statusSuffix}-${stamp}.csv`;
}
