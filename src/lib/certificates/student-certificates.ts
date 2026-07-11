import "server-only";

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
  issuedAtLabel?: string;
  downloadPath?: string;
}

/** Demo: HTML & CSS (Web Development) issued; all other modules locked. */
function isDemoIssuedModule(programSlug: string, moduleName: string): boolean {
  return programSlug === "web-development" && moduleName === "HTML & CSS";
}

export function certificatesEnabledForStudent(email?: string | null): boolean {
  return isDemoPortalStudent(email);
}

export function getStudentCertificateModules(user: Pick<PortalUser, "id" | "email" | "name" | "programSlug">): StudentCertificateModuleView[] {
  if (!certificatesEnabledForStudent(user.email)) {
    return [];
  }

  const issuedAt = new Date("2026-07-11T00:00:00.000Z");
  const issuedLabel = formatCertificateDate(issuedAt);
  const programSlugs = getStudentPortalProgramSlugs(user);
  const views: StudentCertificateModuleView[] = [];

  for (const programSlug of programSlugs) {
    const program = getProgramBySlug(programSlug);
    if (!program) continue;

    for (const mod of program.modules) {
      const issued = isDemoIssuedModule(programSlug, mod.name);
      const certificateId = issued
        ? buildCertificateId(user.id, programSlug, mod.name)
        : undefined;

      views.push({
        programSlug,
        programTitle: program.title,
        moduleName: mod.name,
        status: issued ? "issued" : "locked",
        certificateId,
        issuedAtLabel: issued ? issuedLabel : undefined,
        downloadPath: issued
          ? `/api/student/certificates/download?program=${encodeURIComponent(programSlug)}&module=${encodeURIComponent(mod.name)}`
          : undefined,
      });
    }
  }

  return views;
}

export function canDownloadCertificate(
  user: Pick<PortalUser, "id" | "email" | "name" | "programSlug">,
  programSlug: string,
  moduleName: string
): boolean {
  if (!certificatesEnabledForStudent(user.email)) return false;
  if (!isDemoIssuedModule(programSlug, moduleName)) return false;
  return getStudentPortalProgramSlugs(user).includes(programSlug);
}

export function getCertificateRenderPayload(
  user: Pick<PortalUser, "id" | "email" | "name" | "programSlug">,
  programSlug: string,
  moduleName: string
) {
  if (!canDownloadCertificate(user, programSlug, moduleName)) {
    return null;
  }

  const program = getProgramBySlug(programSlug);
  if (!program) return null;

  const issuedAt = new Date("2026-07-11T00:00:00.000Z");

  return {
    studentName: user.name,
    moduleName,
    programTitle: program.title,
    completionDate: formatCertificateDate(issuedAt),
    certificateId: buildCertificateId(user.id, programSlug, moduleName),
  };
}
