import { prisma } from "@/lib/prisma";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import { getProgramBySlug } from "@/lib/data/programs";
import { buildCertificateId, formatCertificateDate } from "@/lib/certificates/certificate-ids";
import { getStudentPortalProgramSlugs } from "@/lib/student-portal/program-scope";
import type { PortalUser } from "@/types/portal";

import { normalizeProgramSlug } from "@/lib/auth/program-assignment";

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
  user: Pick<PortalUser, "id" | "email" | "name" | "programSlug" | "programSlugs" | "level">
): Promise<StudentCertificateModuleView[]> {
  const programSlugs = await getStudentPortalProgramSlugs(user);

  // Fetch real database certificates and student admission records
  const [dbCertificates, approvedEnrollments, activeModuleEnrollments] = await Promise.all([
    prisma.certificate.findMany({
      where: {
        studentId: user.id,
        status: "issued",
      },
    }),
    user.email
      ? prisma.enrollment.findMany({
          where: {
            email: { equals: user.email.trim(), mode: "insensitive" },
            status: "approved",
          },
          select: { program: true, level: true },
        })
      : Promise.resolve([]),
    user.email
      ? prisma.moduleEnrollment.findMany({
          where: {
            email: { equals: user.email.trim(), mode: "insensitive" },
            status: { in: ["active", "completed"] },
          },
          select: { programSlug: true, moduleName: true },
        })
      : Promise.resolve([]),
  ]);

  const certMap = new Map(
    dbCertificates.map((c) => [`${c.programSlug}:${c.moduleName.trim().toLowerCase()}`, c])
  );

  const views: StudentCertificateModuleView[] = [];

  for (const programSlug of programSlugs) {
    const program = getProgramBySlug(programSlug);
    if (!program) continue;

    const normProg = normalizeProgramSlug(programSlug);

    // Collect all modules the student has actually taken admission in for this program
    const enrolledModuleNames = new Set<string>();

    for (const e of approvedEnrollments) {
      if (normalizeProgramSlug(e.program) === normProg && e.level) {
        enrolledModuleNames.add(e.level.trim().toLowerCase());
      }
    }

    for (const m of activeModuleEnrollments) {
      if (normalizeProgramSlug(m.programSlug) === normProg && m.moduleName) {
        enrolledModuleNames.add(m.moduleName.trim().toLowerCase());
      }
    }

    if (user.programSlug && normalizeProgramSlug(user.programSlug) === normProg && user.level) {
      enrolledModuleNames.add(user.level.trim().toLowerCase());
    }

    // Demo student fallback for demo courses
    if (isDemoPortalStudent(user.email)) {
      if (normProg === "web-development") enrolledModuleNames.add("html & css");
      if (normProg === "app-development") enrolledModuleNames.add("dart & oop");
    }

    // Include any module where a certificate is already issued in DB
    for (const c of dbCertificates) {
      if (normalizeProgramSlug(c.programSlug) === normProg) {
        enrolledModuleNames.add(c.moduleName.trim().toLowerCase());
      }
    }

    // Filter program modules to strictly those the student applied for or has cert for
    const activeModules = program.modules.filter((mod) => {
      return enrolledModuleNames.has(mod.name.trim().toLowerCase());
    });

    for (const mod of activeModules) {
      const key = `${programSlug}:${mod.name.trim().toLowerCase()}`;
      const dbCert = certMap.get(key);

      const isDemoIssued =
        isDemoPortalStudent(user.email) &&
        ((programSlug === "web-development" && mod.name === "HTML & CSS") ||
          (programSlug === "app-development" && mod.name === "Dart & OOP"));
      const isIssued = Boolean(dbCert || isDemoIssued);

      const verificationCode =
        dbCert?.verificationCode ??
        (isDemoIssued ? buildCertificateId(user.id, programSlug, mod.name) : undefined);
      const issuedAt = dbCert?.issuedAt ?? new Date("2026-07-11T00:00:00.000Z");

      views.push({
        programSlug,
        programTitle: program.title,
        moduleName: mod.name,
        status: isIssued ? "issued" : "locked",
        certificateId: verificationCode,
        verificationCode,
        issuedAtLabel: isIssued ? formatCertificateDate(issuedAt) : undefined,
        downloadPath:
          isIssued && verificationCode
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
  const isDemo = isDemoPortalStudent(user.email);
  if (isDemo) {
    if (programSlug === "web-development" && moduleName === "HTML & CSS") return true;
    if (programSlug === "app-development" && moduleName === "Dart & OOP") return true;
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
