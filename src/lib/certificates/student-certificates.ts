import { prisma } from "@/lib/prisma";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import { getProgramBySlug } from "@/lib/data/programs";
import { buildCertificateId, formatCertificateDate } from "@/lib/certificates/certificate-ids";
import { getStudentPortalProgramSlugs } from "@/lib/student-portal/program-scope";
import type { PortalUser } from "@/types/portal";

export type CertificateModuleStatus = "locked" | "issued";

export interface StudentCertificateModuleView {
  programSlug: string;
  programTitle: string;
  moduleName: string;
  status: CertificateModuleStatus;
  certificateId?: string;
  verificationCode?: string;
  issuedAtLabel?: string;
  downloadPath?: string;
  verifyPath?: string;
}

export function certificatesEnabledForStudent(email?: string | null): boolean {
  return true;
}

export async function getStudentCertificateModules(
  user: Pick<PortalUser, "id" | "email" | "name" | "programSlug" | "programSlugs">
): Promise<StudentCertificateModuleView[]> {
  const programSlugs = await getStudentPortalProgramSlugs(user);

  // Fetch real database certificates for this student
  const dbCertificates = await prisma.certificate.findMany({
    where: {
      studentId: user.id,
      status: "issued",
    },
  });

  const certMap = new Map(
    dbCertificates.map((c) => [`${c.programSlug}:${c.moduleName.trim().toLowerCase()}`, c])
  );

  const views: StudentCertificateModuleView[] = [];

  for (const programSlug of programSlugs) {
    const program = getProgramBySlug(programSlug);
    if (!program) continue;

    for (const mod of program.modules) {
      const key = `${programSlug}:${mod.name.trim().toLowerCase()}`;
      const dbCert = certMap.get(key);

      // Demo fallback if demo student
      const isDemoIssued = isDemoPortalStudent(user.email) && programSlug === "web-development" && mod.name === "HTML & CSS";
      const isIssued = Boolean(dbCert || isDemoIssued);

      const verificationCode = dbCert?.verificationCode ?? (isDemoIssued ? buildCertificateId(user.id, programSlug, mod.name) : undefined);
      const issuedAt = dbCert?.issuedAt ?? new Date("2026-07-11T00:00:00.000Z");

      views.push({
        programSlug,
        programTitle: program.title,
        moduleName: mod.name,
        status: isIssued ? "issued" : "locked",
        certificateId: verificationCode,
        verificationCode,
        issuedAtLabel: isIssued ? formatCertificateDate(issuedAt) : undefined,
        downloadPath: isIssued && verificationCode
          ? `/api/student/certificates/download?code=${encodeURIComponent(verificationCode)}&program=${encodeURIComponent(programSlug)}&module=${encodeURIComponent(mod.name)}`
          : undefined,
        verifyPath: verificationCode ? `/verify/${encodeURIComponent(verificationCode)}` : undefined,
      });
    }
  }

  return views;
}

export async function canDownloadCertificate(
  user: Pick<PortalUser, "id" | "email" | "name" | "programSlug" | "programSlugs">,
  programSlug: string,
  moduleName: string
): Promise<boolean> {
  if (isDemoPortalStudent(user.email) && programSlug === "web-development" && moduleName === "HTML & CSS") {
    return true;
  }

  const cert = await prisma.certificate.findFirst({
    where: {
      studentId: user.id,
      programSlug,
      moduleName: { equals: moduleName.trim(), mode: "insensitive" },
      status: "issued",
    },
  });

  return Boolean(cert);
}

export async function getCertificateRenderPayload(
  user: Pick<PortalUser, "id" | "email" | "name" | "programSlug" | "programSlugs">,
  programSlug: string,
  moduleName: string
) {
  const canDownload = await canDownloadCertificate(user, programSlug, moduleName);
  if (!canDownload) return null;

  const dbCert = await prisma.certificate.findFirst({
    where: {
      studentId: user.id,
      programSlug,
      moduleName: { equals: moduleName.trim(), mode: "insensitive" },
    },
  });

  const program = getProgramBySlug(programSlug);
  const courseTitle = dbCert?.courseNameSnapshot ?? program?.title ?? programSlug;
  const verificationCode = dbCert?.verificationCode ?? buildCertificateId(user.id, programSlug, moduleName);
  const completionDate = dbCert?.completionDate ?? new Date();

  return {
    studentName: user.name || dbCert?.studentNameSnapshot || "Student",
    moduleName: dbCert?.moduleNameSnapshot ?? moduleName,
    programTitle: courseTitle,
    completionDate: formatCertificateDate(completionDate),
    certificateId: verificationCode,
  };
}
