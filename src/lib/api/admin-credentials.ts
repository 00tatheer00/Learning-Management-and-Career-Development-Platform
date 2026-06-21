import { prisma } from "@/lib/prisma";
import { decryptPortalPassword } from "@/lib/auth/portal-password-vault";
import { getProgramBySlug } from "@/lib/data/programs";
import { getPortalLoginUrl } from "@/lib/site-url";

export interface AdminCredentialRow {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  course: string;
  programSlug: string;
  module: string;
  batch: string;
  password: string | null;
  hasStoredPassword: boolean;
  approvedAt: string | null;
  loginUrl: string;
}

export async function getAdminCredentialRows(): Promise<AdminCredentialRow[]> {
  const loginUrl = getPortalLoginUrl();
  const students = await prisma.user.findMany({
    where: { role: "student" },
    orderBy: { createdAt: "desc" },
  });

  if (students.length === 0) return [];

  const emails = students.map((student) => student.email.toLowerCase());
  const enrollments = await prisma.enrollment.findMany({
    where: { email: { in: emails }, status: "approved" },
    orderBy: { reviewedAt: "desc" },
  });

  const enrollmentByEmail = new Map<string, (typeof enrollments)[number][]>();
  for (const enrollment of enrollments) {
    const key = enrollment.email.toLowerCase();
    const list = enrollmentByEmail.get(key) ?? [];
    list.push(enrollment);
    enrollmentByEmail.set(key, list);
  }

  return students.map((student) => {
    const approved = enrollmentByEmail.get(student.email.toLowerCase()) ?? [];
    const enrollment =
      approved.find((entry) => entry.program === student.programSlug) ?? approved[0];
    const programSlug = student.programSlug ?? enrollment?.program ?? "";
    const course = getProgramBySlug(programSlug)?.title ?? (programSlug || "—");
    const password = decryptPortalPassword(enrollment?.portalPasswordEnc);

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      whatsapp: student.phone ?? enrollment?.whatsapp ?? "—",
      course,
      programSlug,
      module: student.level ?? enrollment?.level ?? "—",
      batch: student.batch ?? enrollment?.batch ?? "—",
      password,
      hasStoredPassword: Boolean(password),
      approvedAt: enrollment?.reviewedAt?.toISOString() ?? student.createdAt.toISOString(),
      loginUrl,
    };
  });
}
