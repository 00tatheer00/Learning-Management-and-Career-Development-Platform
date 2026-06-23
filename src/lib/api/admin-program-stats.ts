import { prisma } from "@/lib/prisma";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { resolveTrainerIdForProgram } from "@/lib/auth/program-assignment";

export interface ProgramCountPair {
  programSlug: string;
  registrations: number;
  students: number;
  trainerAssigned: number;
}

export interface AdminProgramStats {
  totalEnrollments: number;
  pendingEnrollments: number;
  approvedRegistrations: number;
  activeStudents: number;
  inactiveStudents: number;
  trainerAssignedStudents: number;
  missingTrainerAssignments: number;
  returningRegistrations: number;
  byProgram: ProgramCountPair[];
}

export async function getAdminProgramStats(): Promise<AdminProgramStats> {
  const [enrollments, students] = await Promise.all([
    prisma.enrollment.findMany({ select: { status: true, program: true, email: true } }),
    prisma.user.findMany({
      where: { role: "student" },
      select: { programSlug: true, isActive: true, trainerId: true },
    }),
  ]);

  const approved = enrollments.filter((row) => row.status === "approved");
  const activeStudents = students.filter((row) => row.isActive);
  const inactiveStudents = students.length - activeStudents.length;

  const approvedEmails = new Set(approved.map((row) => row.email.toLowerCase()));
  const returningRegistrations = Math.max(0, approved.length - approvedEmails.size);

  const byProgram = ENROLLABLE_PROGRAM_SLUGS.map((programSlug) => {
    const registrations = approved.filter((row) => row.program === programSlug).length;
    const programStudents = activeStudents.filter((row) => row.programSlug === programSlug);
    const trainerAssigned = programStudents.filter((row) => row.trainerId).length;

    return {
      programSlug,
      registrations,
      students: programStudents.length,
      trainerAssigned,
    };
  });

  const missingTrainerAssignments = activeStudents.filter(
    (row) =>
      row.programSlug &&
      ENROLLABLE_PROGRAM_SLUGS.includes(row.programSlug as (typeof ENROLLABLE_PROGRAM_SLUGS)[number]) &&
      !row.trainerId
  ).length;

  return {
    totalEnrollments: enrollments.length,
    pendingEnrollments: enrollments.filter((row) => row.status === "pending").length,
    approvedRegistrations: approved.length,
    activeStudents: activeStudents.length,
    inactiveStudents,
    trainerAssignedStudents: activeStudents.filter((row) => row.trainerId).length,
    missingTrainerAssignments,
    returningRegistrations,
    byProgram,
  };
}

export async function repairMissingTrainerAssignments(): Promise<{
  fixed: number;
  skipped: number;
  remaining: number;
}> {
  const students = await prisma.user.findMany({
    where: {
      role: "student",
      isActive: true,
      programSlug: { not: null },
      OR: [{ trainerId: null }, { trainerId: "" }],
    },
    select: { id: true, programSlug: true },
  });

  let fixed = 0;
  let skipped = 0;

  for (const student of students) {
    if (!student.programSlug) {
      skipped++;
      continue;
    }
    const trainerId = await resolveTrainerIdForProgram(student.programSlug);
    if (!trainerId) {
      skipped++;
      continue;
    }
    await prisma.user.update({
      where: { id: student.id },
      data: { trainerId },
    });
    fixed++;
  }

  const remaining = await prisma.user.count({
    where: {
      role: "student",
      isActive: true,
      programSlug: { not: null },
      OR: [{ trainerId: null }, { trainerId: "" }],
    },
  });

  return { fixed, skipped, remaining };
}
