import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";
import { buildCertificateId, formatCertificateDate } from "@/lib/certificates/certificate-ids";
import { renderCertificatePng } from "@/lib/certificates/render-certificate";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import { normalizeProgramSlug } from "@/lib/auth/program-assignment";

export interface EligibleStudentView {
  studentId: string;
  name: string;
  email: string;
  programSlug: string;
  moduleName: string;
  isEligible: boolean;
  status: "issued" | "pending";
  verificationCode?: string;
  issuedAt?: string;
  certificateId?: string;
}

function normalizeModuleName(name?: string | null): string {
  if (!name) return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

export async function getEligibleStudentsForModule(
  programSlug: string,
  moduleName: string
): Promise<{
  eligibleStudents: EligibleStudentView[];
  stats: { totalEligible: number; generatedCount: number; pendingCount: number };
}> {
  const normSlug = normalizeProgramSlug(programSlug);
  const normModule = normalizeModuleName(moduleName);

  const program = getProgramBySlug(programSlug);
  const firstModuleRaw = program?.modules[0]?.name ?? "";
  const firstModuleNorm = normalizeModuleName(firstModuleRaw);
  const isFirstModule = normModule === firstModuleNorm;

  // 1. Batch query for students, enrollments, module enrollments, and certificates
  const [students, approvedEnrollments, activeModuleEnrollments, existingCertificates] =
    await Promise.all([
      prisma.user.findMany({
        where: {
          role: "student",
          isActive: true,
        },
        select: { id: true, name: true, email: true, programSlug: true, level: true },
        orderBy: { name: "asc" },
      }),
      prisma.enrollment.findMany({
        where: { status: "approved" },
        select: { email: true, program: true, level: true },
      }),
      prisma.moduleEnrollment.findMany({
        where: { status: { in: ["active", "completed"] } },
        select: { email: true, programSlug: true, moduleName: true },
      }),
      prisma.certificate.findMany({
        where: {
          programSlug,
          moduleName: { equals: moduleName.trim(), mode: "insensitive" },
        },
      }),
    ]);

  // 2. Build in-memory lookup sets for students eligible for this specific module
  const approvedEmailSet = new Set<string>();

  for (const row of approvedEnrollments) {
    if (!row.email) continue;
    const emailNorm = row.email.trim().toLowerCase();
    const rowProg = normalizeProgramSlug(row.program);
    if (rowProg === normSlug) {
      if (isFirstModule) {
        // For the first module, ALL approved students for the program are eligible
        approvedEmailSet.add(emailNorm);
      } else {
        const rowModuleNorm = normalizeModuleName(row.level);
        if (rowModuleNorm === normModule) {
          approvedEmailSet.add(emailNorm);
        }
      }
    }
  }

  for (const row of activeModuleEnrollments) {
    if (!row.email) continue;
    const emailNorm = row.email.trim().toLowerCase();
    const rowProg = normalizeProgramSlug(row.programSlug);
    if (rowProg === normSlug) {
      const rowModuleNorm = normalizeModuleName(row.moduleName);
      if (rowModuleNorm === normModule || isFirstModule) {
        approvedEmailSet.add(emailNorm);
      }
    }
  }

  const certByStudentId = new Map(existingCertificates.map((c) => [c.studentId, c]));

  const eligibleStudents: EligibleStudentView[] = [];

  for (const student of students) {
    const studentEmailNorm = student.email.trim().toLowerCase();
    const existingCert = certByStudentId.get(student.id);

    const studentProg = normalizeProgramSlug(student.programSlug ?? "");
    const isDemo =
      isDemoPortalStudent(student.email) &&
      (studentProg === normSlug || (normSlug === "web-development" && (!studentProg || studentProg === "web-development")));
    const hasApprovedEnrollment = approvedEmailSet.has(studentEmailNorm);

    const isStudentInModule = isFirstModule
      ? studentProg === normSlug
      : studentProg === normSlug && normalizeModuleName(student.level) === normModule;

    const isEligible = Boolean(isDemo || hasApprovedEnrollment || isStudentInModule || existingCert);

    if (!isEligible) continue;

    eligibleStudents.push({
      studentId: student.id,
      name: student.name,
      email: student.email,
      programSlug,
      moduleName,
      isEligible: true,
      status: existingCert ? "issued" : "pending",
      verificationCode: existingCert?.verificationCode,
      issuedAt: existingCert ? formatCertificateDate(existingCert.issuedAt) : undefined,
      certificateId: existingCert?.id,
    });
  }

  const generatedCount = eligibleStudents.filter((s) => s.status === "issued").length;
  const pendingCount = eligibleStudents.length - generatedCount;

  return {
    eligibleStudents,
    stats: {
      totalEligible: eligibleStudents.length,
      generatedCount,
      pendingCount,
    },
  };
}

export async function resetCertificates(filter?: {
  studentId?: string;
  programSlug?: string;
  moduleName?: string;
}): Promise<number> {
  const where: Record<string, string> = {};
  if (filter?.studentId) where.studentId = filter.studentId;
  if (filter?.programSlug) where.programSlug = filter.programSlug;
  if (filter?.moduleName) where.moduleName = filter.moduleName;

  const result = await prisma.certificate.deleteMany({
    where,
  });

  return result.count;
}

export async function generateSingleCertificate(input: {
  studentId: string;
  programSlug: string;
  moduleName: string;
  completionDate?: Date;
  indexOverride?: number;
}) {
  const student = await prisma.user.findUnique({
    where: { id: input.studentId },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const program = getProgramBySlug(input.programSlug);
  const courseTitle = program?.title ?? input.programSlug;

  // Check if student already has a certificate
  const existingCert = await prisma.certificate.findFirst({
    where: {
      studentId: input.studentId,
      programSlug: input.programSlug,
      moduleName: input.moduleName,
    },
  });

  let indexNumber = input.indexOverride;
  if (!indexNumber) {
    if (existingCert?.verificationCode) {
      const match = existingCert.verificationCode.match(/-(\d+)$/);
      if (match) {
        indexNumber = parseInt(match[1], 10);
      }
    }
  }

  if (!indexNumber) {
    // Find highest used index number for this module
    const allCerts = await prisma.certificate.findMany({
      where: { programSlug: input.programSlug, moduleName: input.moduleName },
      select: { verificationCode: true },
    });

    let maxIndex = 0;
    for (const c of allCerts) {
      const m = c.verificationCode?.match(/-(\d+)$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (num > maxIndex) maxIndex = num;
      }
    }
    indexNumber = maxIndex + 1;
  }

  const verificationCode = buildCertificateId(
    input.studentId,
    input.programSlug,
    input.moduleName,
    indexNumber
  );

  const completionDate = input.completionDate ?? new Date();

  // Test render to ensure 100% valid vector output
  await renderCertificatePng({
    studentName: student.name,
    moduleName: input.moduleName,
    programTitle: courseTitle,
    completionDate: formatCertificateDate(completionDate),
    certificateId: verificationCode,
  });

  const id = existingCert?.id ?? `cert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const certificate = await prisma.certificate.upsert({
    where: {
      studentId_programSlug_moduleName: {
        studentId: input.studentId,
        programSlug: input.programSlug,
        moduleName: input.moduleName,
      },
    },
    create: {
      id,
      studentId: input.studentId,
      studentNameSnapshot: student.name,
      programSlug: input.programSlug,
      courseNameSnapshot: courseTitle,
      moduleName: input.moduleName,
      moduleNameSnapshot: input.moduleName,
      verificationCode,
      certificateNumber: verificationCode,
      completionDate,
      issuedAt: new Date(),
      status: "issued",
    },
    update: {
      studentNameSnapshot: student.name,
      courseNameSnapshot: courseTitle,
      moduleNameSnapshot: input.moduleName,
      verificationCode,
      certificateNumber: verificationCode,
      completionDate,
      issuedAt: new Date(),
      status: "issued",
    },
  });

  return certificate;
}

export async function generateBulkCertificates(
  programSlug: string,
  moduleName: string,
  options?: { regenerateAll?: boolean }
): Promise<{
  total: number;
  generatedCount: number;
  failedCount: number;
  results: Array<{ studentId: string; name: string; success: boolean; verificationCode?: string; error?: string }>;
}> {
  const { eligibleStudents } = await getEligibleStudentsForModule(programSlug, moduleName);
  const targetStudents = options?.regenerateAll
    ? eligibleStudents
    : eligibleStudents.filter((s) => s.status === "pending");

  const results: Array<{ studentId: string; name: string; success: boolean; verificationCode?: string; error?: string }> = [];
  let generatedCount = 0;
  let failedCount = 0;

  // Assign deterministic, sequential 1-based index numbers across students
  for (let i = 0; i < targetStudents.length; i++) {
    const student = targetStudents[i];
    const studentIndex = i + 1; // 1 -> 0001, 2 -> 0002, ..., 145 -> 0145

    try {
      const cert = await generateSingleCertificate({
        studentId: student.studentId,
        programSlug,
        moduleName,
        indexOverride: studentIndex,
      });
      generatedCount++;
      results.push({
        studentId: student.studentId,
        name: student.name,
        success: true,
        verificationCode: cert.verificationCode,
      });
    } catch (err) {
      failedCount++;
      results.push({
        studentId: student.studentId,
        name: student.name,
        success: false,
        error: err instanceof Error ? err.message : "Failed to generate certificate",
      });
    }
  }

  return {
    total: targetStudents.length,
    generatedCount,
    failedCount,
    results,
  };
}

export async function verifyCertificateByCode(verificationCode: string) {
  if (!verificationCode) return null;
  const codeNormalized = verificationCode.trim();

  let cert = await prisma.certificate.findFirst({
    where: {
      verificationCode: {
        equals: codeNormalized,
        mode: "insensitive",
      },
    },
    include: {
      student: {
        select: { name: true, email: true },
      },
    },
  });

  // If not found directly, try compact dash normalization
  if (!cert) {
    const compact = codeNormalized.replace(/[\s_]+/g, "-");
    cert = await prisma.certificate.findFirst({
      where: {
        verificationCode: {
          equals: compact,
          mode: "insensitive",
        },
      },
      include: {
        student: {
          select: { name: true, email: true },
        },
      },
    });
  }

  if (!cert) return null;

  return {
    verificationCode: cert.verificationCode,
    studentName: cert.student?.name || cert.studentNameSnapshot,
    courseTitle: cert.courseNameSnapshot,
    moduleName: cert.moduleNameSnapshot,
    completionDateLabel: formatCertificateDate(cert.completionDate),
    issuedAtLabel: formatCertificateDate(cert.issuedAt),
    certificateId: cert.id,
    status: cert.status,
  };
}
