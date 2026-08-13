import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";
import { buildCertificateId, formatCertificateDate } from "@/lib/certificates/certificate-ids";
import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";
import { renderCertificatePng } from "@/lib/certificates/render-certificate";

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

export async function getEligibleStudentsForModule(
  programSlug: string,
  moduleName: string
): Promise<{
  eligibleStudents: EligibleStudentView[];
  stats: { totalEligible: number; generatedCount: number; pendingCount: number };
}> {
  const program = getProgramBySlug(programSlug);
  const courseTitle = program?.title ?? programSlug;

  // 1. Fetch all student accounts for this program or across platform
  const students = await prisma.user.findMany({
    where: {
      role: "student",
      isActive: true,
    },
    select: { id: true, name: true, email: true, programSlug: true, level: true },
    orderBy: { name: "asc" },
  });

  // 2. Fetch all existing certificates for this program and module
  const existingCertificates = await prisma.certificate.findMany({
    where: {
      programSlug,
      moduleName,
    },
  });

  const certByStudentId = new Map(existingCertificates.map((c) => [c.studentId, c]));

  const eligibleStudents: EligibleStudentView[] = [];

  for (const student of students) {
    // Check if student has approved level access for this program & module
    const approved = await getApprovedEnrollmentLevels(student.email, programSlug);
    const isApprovedForModule = approved.some(
      (m) => m.trim().toLowerCase() === moduleName.trim().toLowerCase()
    );

    if (!isApprovedForModule) continue;

    const existingCert = certByStudentId.get(student.id);

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

export async function generateSingleCertificate(input: {
  studentId: string;
  programSlug: string;
  moduleName: string;
  completionDate?: Date;
}) {
  const student = await prisma.user.findUnique({
    where: { id: input.studentId },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const program = getProgramBySlug(input.programSlug);
  const courseTitle = program?.title ?? input.programSlug;

  // Count existing certificates to determine sequence number
  const existingCount = await prisma.certificate.count({
    where: { programSlug: input.programSlug, moduleName: input.moduleName },
  });

  const verificationCode = buildCertificateId(
    input.studentId,
    input.programSlug,
    input.moduleName,
    existingCount + 1
  );

  const completionDate = input.completionDate ?? new Date();

  // Test render to verify visual output before saving record
  await renderCertificatePng({
    studentName: student.name,
    moduleName: input.moduleName,
    programTitle: courseTitle,
    completionDate: formatCertificateDate(completionDate),
    certificateId: verificationCode,
  });

  const id = `cert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

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
      completionDate,
      issuedAt: new Date(),
      status: "issued",
    },
  });

  return certificate;
}

export async function generateBulkCertificates(
  programSlug: string,
  moduleName: string
): Promise<{
  total: number;
  generatedCount: number;
  failedCount: number;
  results: Array<{ studentId: string; name: string; success: boolean; error?: string }>;
}> {
  const { eligibleStudents } = await getEligibleStudentsForModule(programSlug, moduleName);
  const pendingStudents = eligibleStudents.filter((s) => s.status === "pending");

  const results: Array<{ studentId: string; name: string; success: boolean; error?: string }> = [];
  let generatedCount = 0;
  let failedCount = 0;

  // Safe batched processing (5 at a time)
  const batchSize = 5;
  for (let i = 0; i < pendingStudents.length; i += batchSize) {
    const batch = pendingStudents.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (student) => {
        try {
          await generateSingleCertificate({
            studentId: student.studentId,
            programSlug,
            moduleName,
          });
          generatedCount++;
          results.push({ studentId: student.studentId, name: student.name, success: true });
        } catch (err) {
          failedCount++;
          results.push({
            studentId: student.studentId,
            name: student.name,
            success: false,
            error: err instanceof Error ? err.message : "Failed to generate certificate",
          });
        }
      })
    );
  }

  return {
    total: pendingStudents.length,
    generatedCount,
    failedCount,
    results,
  };
}

export async function verifyCertificateByCode(verificationCode: string) {
  const codeNormalized = verificationCode.trim();
  const cert = await prisma.certificate.findFirst({
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

  if (!cert) return null;

  return {
    verificationCode: cert.verificationCode,
    studentName: cert.studentNameSnapshot,
    courseTitle: cert.courseNameSnapshot,
    moduleName: cert.moduleNameSnapshot,
    completionDateLabel: formatCertificateDate(cert.completionDate),
    issuedAtLabel: formatCertificateDate(cert.issuedAt),
    certificateId: cert.id,
    status: cert.status,
  };
}
