import { prisma } from "@/lib/prisma";
import { getUserById } from "@/lib/auth/users";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { getProgramBySlug } from "@/lib/data/programs";
import { DEFAULT_BATCH_NAME } from "@/lib/constants/batch";
import { formatAppliedDate, formatAppliedDateTime } from "@/lib/utils";

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

export async function getAdminStudentRows(): Promise<AdminStudentRow[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "approved" },
    orderBy: [{ reviewedAt: "desc" }, { createdAt: "desc" }],
  });

  if (enrollments.length === 0) return [];

  const emails = [...new Set(enrollments.map((entry) => entry.email.toLowerCase()))];
  const students = await prisma.user.findMany({
    where: { role: "student", email: { in: emails } },
  });
  const studentByEmail = new Map(students.map((student) => [student.email.toLowerCase(), student]));

  const rows: AdminStudentRow[] = [];

  for (const enrollment of enrollments) {
    const student = studentByEmail.get(enrollment.email.toLowerCase());
    if (!student) continue;

    const programSlug = enrollment.program;
    const course = getProgramBySlug(programSlug)?.title ?? programSlug;

    rows.push({
      id: enrollment.id,
      studentId: student.id,
      name: enrollment.fullName || student.name,
      email: student.email,
      whatsapp: student.phone ?? enrollment.whatsapp ?? "—",
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
      isActive: student.isActive,
      joinedAt: student.createdAt.toISOString(),
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

export function filterAdminStudentRows(
  rows: AdminStudentRow[],
  options?: { program?: string; module?: string; activeOnly?: boolean }
): AdminStudentRow[] {
  let result = rows;
  if (options?.program && options.program !== "all") {
    result = result.filter((row) => row.programSlug === options.program);
  }
  if (options?.module && options.module !== "all") {
    result = result.filter((row) => row.module === options.module);
  }
  if (options?.activeOnly) {
    result = result.filter((row) => row.isActive);
  }
  return result;
}

function moduleSlugForFilename(moduleName: string): string {
  return moduleName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildStudentsExportFilename(
  optionsOrSlug?: string | { programSlug?: string; moduleName?: string }
) {
  const stamp = new Date().toISOString().slice(0, 10);

  if (typeof optionsOrSlug === "string") {
    if (optionsOrSlug === "web-development") return `eest-web-students-${stamp}.csv`;
    if (optionsOrSlug === "app-development") return `eest-app-students-${stamp}.csv`;
    return `eest-students-all-${stamp}.csv`;
  }

  const options = optionsOrSlug;
  if (options?.programSlug && options?.moduleName) {
    const programPrefix =
      options.programSlug === "web-development"
        ? "web"
        : options.programSlug === "app-development"
          ? "app"
          : options.programSlug;
    return `eest-${programPrefix}-${moduleSlugForFilename(options.moduleName)}-students-${stamp}.csv`;
  }
  if (options?.programSlug === "web-development") return `eest-web-students-${stamp}.csv`;
  if (options?.programSlug === "app-development") return `eest-app-students-${stamp}.csv`;
  return `eest-students-all-${stamp}.csv`;
}

export function isValidModuleForProgram(programSlug: string, moduleName: string): boolean {
  const program = getProgramBySlug(programSlug);
  return (program?.modules ?? []).some((mod) => mod.name === moduleName);
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
