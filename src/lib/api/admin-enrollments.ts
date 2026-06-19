import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";
import { DEFAULT_BATCH_NAME } from "@/lib/constants/batch";
import { formatAppliedDateTime } from "@/lib/utils";
import type { EnrollmentRecord } from "@/types/portal";

export interface AdminEnrollmentRow extends EnrollmentRecord {
  courseTitle: string;
  reviewerName?: string;
}

export async function getAdminEnrollmentRows(): Promise<AdminEnrollmentRow[]> {
  const records = await prisma.enrollment.findMany({
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

  return records.map((record) => ({
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
    paymentScreenshot: record.paymentScreenshot ?? undefined,
    status: record.status,
    reviewedAt: record.reviewedAt?.toISOString(),
    reviewedBy: record.reviewedBy ?? undefined,
    adminNotes: record.adminNotes ?? undefined,
    createdAt: record.createdAt.toISOString(),
    courseTitle: getProgramBySlug(record.program)?.title ?? record.program,
    reviewerName: record.reviewedBy
      ? reviewerNameById.get(record.reviewedBy) ?? "Admin"
      : undefined,
  }));
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
    "Reviewed On",
    "Reviewed By",
    "Admin Notes",
  ];

  const lines = rows.map((row) =>
    [
      row.status,
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
      row.reviewedAt ? formatAppliedDateTime(row.reviewedAt) : "",
      row.reviewerName ?? "",
      row.adminNotes ?? "",
    ]
      .map(escapeCsv)
      .join(",")
  );

  return `\uFEFF${headers.join(",")}\n${lines.join("\n")}`;
}

export function buildEnrollmentsExportFilename(status?: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = status && status !== "all" ? `-${status}` : "";
  return `eest-registrations${suffix}-${stamp}.csv`;
}
