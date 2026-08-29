import { prisma } from "@/lib/prisma";
import { getUserById } from "@/lib/auth/users";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { getProgramBySlug } from "@/lib/data/programs";
import { DEFAULT_BATCH_NAME } from "@/lib/constants/batch";
import { formatAppliedDateTime } from "@/lib/utils";
import { getPhaseCreatedAtFilter, type PhaseFilter } from "@/lib/services/phase-service";

export interface AdminStudentRow {
  /** Approved enrollment id (unique row key). */
  id: string;
  /** Portal user id for account-level actions. */
  studentId: string;
  name: string;
  email: string;
  whatsapp: string;
  fatherName: string;
  cnic: string;
  institution: string;
  classSemester: string;
  fieldOfStudy: string;
  course: string;
  programSlug: string;
  module: string;
  batch: string;
  hasLaptop: string;
  internetAvailable: string;
  isActive: boolean;
  joinedAt: string;
  appliedAt: string;
}

export async function getAdminStudentRows(options?: {
  phase?: PhaseFilter;
  program?: string;
  activeOnly?: boolean;
}): Promise<AdminStudentRow[]> {
  const createdAtFilter = getPhaseCreatedAtFilter(options?.phase);

  const where: Record<string, unknown> = { status: "approved" };
  if (createdAtFilter) where.createdAt = createdAtFilter;
  if (options?.program && options.program !== "all") where.program = options.program;

  const enrollments = await prisma.enrollment.findMany({
    where,
    orderBy: [{ reviewedAt: "desc" }, { createdAt: "desc" }],
  });

  if (enrollments.length === 0) return [];

  const emails = Array.from(new Set(enrollments.map((e) => e.email.trim().toLowerCase())));

  const students = await prisma.user.findMany({
    where: {
      role: "student",
      email: { in: emails },
    },
  });

  const studentByEmail = new Map(
    students.map((student) => [student.email.trim().toLowerCase(), student])
  );

  const rows: AdminStudentRow[] = [];

  for (const enrollment of enrollments) {
    const student = studentByEmail.get(enrollment.email.trim().toLowerCase());

    if (options?.activeOnly && student && !student.isActive) {
      continue;
    }

    const programSlug = enrollment.program;
    const course = getProgramBySlug(programSlug)?.title ?? programSlug;

    rows.push({
      id: enrollment.id,
      studentId: student?.id ?? enrollment.id,
      name: enrollment.fullName || student?.name || "Student",
      email: student?.email ?? enrollment.email,
      whatsapp: student?.phone ?? enrollment.whatsapp ?? "—",
      fatherName: enrollment.fatherName ?? "—",
      cnic: enrollment.cnic ?? "—",
      institution: enrollment.institution ?? "—",
      classSemester: enrollment.classSemester ?? "—",
      fieldOfStudy: enrollment.fieldOfStudy ?? "—",
      course,
      programSlug,
      module: enrollment.level,
      batch: enrollment.batch ?? DEFAULT_BATCH_NAME,
      hasLaptop: enrollment.hasLaptop ?? "—",
      internetAvailable: enrollment.internetAvailable ?? "—",
      isActive: student?.isActive ?? true,
      joinedAt: student?.createdAt.toISOString() ?? enrollment.createdAt.toISOString(),
      appliedAt: enrollment.createdAt.toISOString(),
    });
  }

  return rows;
}

function escapeCsv(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildStudentsCsv(rows: AdminStudentRow[]) {
  const headers = [
    "Name",
    "Email",
    "WhatsApp",
    "Father Name",
    "CNIC",
    "Institution",
    "Class/Semester",
    "Field of Study",
    "Course",
    "Module",
    "Batch",
    "Laptop",
    "Internet",
    "Active",
    "Applied On",
    "Joined On",
  ];

  const lines = rows.map((row) =>
    [
      row.name,
      row.email,
      row.whatsapp,
      row.fatherName,
      row.cnic,
      row.institution,
      row.classSemester,
      row.fieldOfStudy,
      row.course,
      row.module,
      row.batch,
      row.hasLaptop,
      row.internetAvailable,
      row.isActive ? "Yes" : "No",
      formatAppliedDateTime(row.appliedAt),
      formatAppliedDateTime(row.joinedAt),
    ]
      .map(escapeCsv)
      .join(",")
  );

  return `\uFEFF${headers.join(",")}\n${lines.join("\n")}`;
}

export function buildStudentsExportFilename(programSlug?: string, phase?: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  const phaseSuffix = phase && phase !== "all" ? `-${phase}` : "";
  if (programSlug === "web-development") return `eest-web-students${phaseSuffix}-${stamp}.csv`;
  if (programSlug === "app-development") return `eest-app-students${phaseSuffix}-${stamp}.csv`;
  if (programSlug === "digital-marketing") return `eest-marketing-students${phaseSuffix}-${stamp}.csv`;
  return `eest-students-all${phaseSuffix}-${stamp}.csv`;
}

export function filterAdminStudentRows(
  rows: AdminStudentRow[],
  options?: { program?: string; activeOnly?: boolean }
): AdminStudentRow[] {
  let result = rows;
  if (options?.program && options.program !== "all") {
    result = result.filter((row) => row.programSlug === options.program);
  }
  if (options?.activeOnly) {
    result = result.filter((row) => row.isActive);
  }
  return result;
}

export async function deleteAdminStudent(
  studentId: string
): Promise<{ success: boolean; message: string; error?: string }> {
  const student = await getUserById(studentId);
  if (!student || student.role !== "student") {
    return { success: false, message: "", error: "Student not found" };
  }

  await prisma.assignmentSubmission.deleteMany({ where: { studentId: student.id } });

  const enrollments = await prisma.enrollment.findMany({
    where: { email: student.email.toLowerCase() },
  });

  for (const enrollment of enrollments) {
    if (enrollment.paymentScreenshotPublicId) {
      void deleteCloudinaryImage(enrollment.paymentScreenshotPublicId);
    }
    if (enrollment.profilePhotoPublicId) {
      void deleteCloudinaryImage(enrollment.profilePhotoPublicId);
    }
  }

  await prisma.enrollment.deleteMany({ where: { email: student.email.toLowerCase() } });
  await prisma.passwordResetToken.deleteMany({ where: { email: student.email.toLowerCase() } });
  await prisma.user.delete({ where: { id: student.id } });

  return {
    success: true,
    message: "Student account and all registration records deleted.",
  };
}
