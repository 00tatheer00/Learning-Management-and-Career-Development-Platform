import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";
import { DEFAULT_BATCH_NAME } from "@/lib/constants/batch";
import { formatAppliedDate, formatAppliedDateTime } from "@/lib/utils";

export interface AdminStudentRow {
  id: string;
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
  const students = await prisma.user.findMany({
    where: { role: "student" },
    orderBy: { createdAt: "desc" },
  });

  if (students.length === 0) return [];

  const emails = students.map((student) => student.email.toLowerCase());
  const enrollments = await prisma.enrollment.findMany({
    where: { email: { in: emails } },
    orderBy: { createdAt: "desc" },
  });

  const enrollmentByEmail = new Map<string, (typeof enrollments)[number]>();
  for (const enrollment of enrollments) {
    const key = enrollment.email.toLowerCase();
    if (!enrollmentByEmail.has(key)) {
      enrollmentByEmail.set(key, enrollment);
    }
  }

  return students.map((student) => {
    const enrollment = enrollmentByEmail.get(student.email.toLowerCase());
    const programSlug = student.programSlug ?? enrollment?.program ?? "";
    const course = getProgramBySlug(programSlug)?.title ?? (programSlug || "—");

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      whatsapp: student.phone ?? enrollment?.whatsapp ?? "—",
      fatherName: enrollment?.fatherName ?? "—",
      cnic: enrollment?.cnic ?? "—",
      institution: enrollment?.institution ?? "—",
      classSemester: enrollment?.classSemester ?? "—",
      fieldOfStudy: enrollment?.fieldOfStudy ?? "—",
      course,
      programSlug,
      module: student.level ?? enrollment?.level ?? "—",
      batch: student.batch ?? enrollment?.batch ?? DEFAULT_BATCH_NAME,
      hasLaptop: enrollment?.hasLaptop ?? "—",
      internetAvailable: enrollment?.internetAvailable ?? "—",
      isActive: student.isActive,
      joinedAt: student.createdAt.toISOString(),
      appliedAt: enrollment?.createdAt.toISOString() ?? student.createdAt.toISOString(),
    };
  });
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

export function buildStudentsExportFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `eest-students-${stamp}.csv`;
}
