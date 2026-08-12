import { prisma } from "@/lib/prisma";
import { getStudentModuleEnrollments } from "@/lib/services/module-enrollment-service";

export interface StudentAcademicOverview {
  studentId: string;
  email: string;
  name: string;
  programSlug: string | null;
  currentLevel: string | null;
  unlockedModules: string[];
  totalClassesAttended: number;
  assignmentsSubmitted: number;
  assignmentsApproved: number;
  lecturesCompleted: number;
}

export interface ModuleAcademicStats {
  programSlug: string;
  moduleName: string;
  totalEnrolledStudents: number;
  activeStudents: number;
  completedStudents: number;
}

/**
 * AcademicProgressionService — Encapsulates student academic progress independently
 * from Admissions statistics (Enrollment registrations).
 */

/**
 * Returns comprehensive academic progression overview for a single student.
 */
export async function getStudentAcademicOverview(
  studentId: string
): Promise<StudentAcademicOverview | null> {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      email: true,
      name: true,
      programSlug: true,
      level: true,
    },
  });

  if (!student) return null;

  const [unlockedModuleRows, attendanceCount, submissions, watchProgress] = await Promise.all([
    student.programSlug
      ? getStudentModuleEnrollments(student.email, student.programSlug)
      : Promise.resolve([]),
    prisma.classAttendance.count({
      where: { studentId: student.id },
    }),
    prisma.assignmentSubmission.findMany({
      where: { studentId: student.id },
      select: { status: true },
    }),
    prisma.watchProgress.count({
      where: { userId: student.id, completed: true },
    }),
  ]);

  const unlockedModules = unlockedModuleRows.map((m) => m.moduleName);
  const assignmentsSubmitted = submissions.length;
  const assignmentsApproved = submissions.filter((s) => s.status === "approved").length;

  return {
    studentId: student.id,
    email: student.email,
    name: student.name,
    programSlug: student.programSlug,
    currentLevel: student.level,
    unlockedModules,
    totalClassesAttended: attendanceCount,
    assignmentsSubmitted,
    assignmentsApproved,
    lecturesCompleted: watchProgress,
  };
}

/**
 * Returns module academic stats (enrolled, active, completed) strictly from academic records.
 */
export async function getModuleAcademicStats(
  programSlug: string,
  moduleName: string
): Promise<ModuleAcademicStats> {
  const normSlug = programSlug.trim().toLowerCase();
  const normModule = moduleName.trim();

  const moduleEnrollments = await prisma.moduleEnrollment.findMany({
    where: {
      programSlug: normSlug,
      moduleName: normModule,
    },
    select: {
      status: true,
    },
  });

  const totalEnrolledStudents = moduleEnrollments.length;
  const activeStudents = moduleEnrollments.filter((m) => m.status === "active").length;
  const completedStudents = moduleEnrollments.filter((m) => m.status === "completed").length;

  return {
    programSlug: normSlug,
    moduleName: normModule,
    totalEnrolledStudents,
    activeStudents,
    completedStudents,
  };
}
