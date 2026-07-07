import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";
import { getPortalLoginUrl } from "@/lib/site-url";
import { DEFAULT_BATCH_NAME } from "@/lib/constants/batch";
import { getAttendanceReport } from "@/lib/api/class-attendance";

export interface AdminStudentProfileEnrollment {
  id: string;
  courseTitle: string;
  program: string;
  level: string;
  batch: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewerName: string | null;
  adminNotes: string | null;
  hasPaymentScreenshot: boolean;
  applicationNumber: number;
}

export interface AdminStudentProfileAttendance {
  id: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  status: "present" | "late";
  joinedAt: string;
}

export interface AdminStudentProfile {
  studentId: string | null;
  focusedEnrollmentId: string | null;
  name: string;
  email: string;
  whatsapp: string;
  fatherName: string | null;
  cnic: string | null;
  institution: string | null;
  classSemester: string | null;
  fieldOfStudy: string | null;
  programSlug: string | null;
  course: string | null;
  module: string | null;
  batch: string | null;
  isActive: boolean | null;
  hasPortalAccount: boolean;
  firstLoginAt: string | null;
  lastLoginAt: string | null;
  joinedAt: string | null;
  loginUrl: string;
  password: string | null;
  hasStoredPassword: boolean;
  trainer: { id: string; name: string; email: string } | null;
  enrollments: AdminStudentProfileEnrollment[];
  attendance: {
    total: number;
    present: number;
    late: number;
    recent: AdminStudentProfileAttendance[];
  };
}

function mapEnrollment(
  record: {
    id: string;
    fullName: string;
    program: string;
    level: string;
    batch: string | null;
    status: string;
    createdAt: Date;
    reviewedAt: Date | null;
    reviewedBy: string | null;
    adminNotes: string | null;
    paymentScreenshot: string | null;
    paymentScreenshotPublicId: string | null;
  },
  reviewerNameById: Map<string, string>,
  applicationNumber: number
): AdminStudentProfileEnrollment {
  return {
    id: record.id,
    courseTitle: getProgramBySlug(record.program)?.title ?? record.program,
    program: record.program,
    level: record.level,
    batch: record.batch ?? DEFAULT_BATCH_NAME,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    reviewerName: record.reviewedBy
      ? reviewerNameById.get(record.reviewedBy) ?? "Admin"
      : null,
    adminNotes: record.adminNotes ?? null,
    hasPaymentScreenshot: Boolean(record.paymentScreenshot || record.paymentScreenshotPublicId),
    applicationNumber,
  };
}

async function buildProfileForEmail(
  email: string,
  focusedEnrollmentId?: string
): Promise<AdminStudentProfile | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const [student, enrollments] = await Promise.all([
    prisma.user.findUnique({ where: { email: normalizedEmail } }),
    prisma.enrollment.findMany({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!student && enrollments.length === 0) return null;

  const reviewerIds = [
    ...new Set(enrollments.map((e) => e.reviewedBy).filter(Boolean)),
  ] as string[];

  const reviewers =
    reviewerIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: reviewerIds } },
          select: { id: true, name: true },
        })
      : [];

  const reviewerNameById = new Map(reviewers.map((u) => [u.id, u.name]));

  const enrollmentsByTime = [...enrollments].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
  const applicationNumberById = new Map(
    enrollmentsByTime.map((e, index) => [e.id, index + 1])
  );

  const latestEnrollment = enrollments[0] ?? null;
  const focusedEnrollment =
    (focusedEnrollmentId
      ? enrollments.find((entry) => entry.id === focusedEnrollmentId)
      : null) ?? null;
  const approvedEnrollment =
    focusedEnrollment ??
    enrollments.find((e) => e.status === "approved" && e.program === student?.programSlug) ??
    enrollments.find((e) => e.status === "approved") ??
    latestEnrollment;

  let trainer: AdminStudentProfile["trainer"] = null;
  if (student?.trainerId) {
    const trainerUser = await prisma.user.findUnique({
      where: { id: student.trainerId },
      select: { id: true, name: true, email: true },
    });
    if (trainerUser) trainer = trainerUser;
  }

  let attendanceRows: AdminStudentProfileAttendance[] = [];
  let present = 0;
  let late = 0;

  if (student) {
    try {
      const records = await getAttendanceReport({ limit: 500 });
      const studentRecords = records.filter((r) => r.studentId === student.id);
      present = studentRecords.filter((r) => r.status === "present").length;
      late = studentRecords.filter((r) => r.status === "late").length;
      attendanceRows = studentRecords.slice(0, 8).map((r) => ({
        id: r.id,
        sessionTitle: r.sessionTitle,
        sessionDate: r.sessionDate,
        sessionTime: r.sessionTime,
        status: r.status,
        joinedAt: r.joinedAt,
      }));
    } catch (error) {
      console.error("Failed to load attendance for student profile:", error);
    }
  }

  const programSlug = student?.programSlug ?? approvedEnrollment?.program ?? latestEnrollment?.program ?? null;
  const course = programSlug ? (getProgramBySlug(programSlug)?.title ?? programSlug) : null;

  return {
    studentId: student?.id ?? null,
    focusedEnrollmentId: focusedEnrollment?.id ?? approvedEnrollment?.id ?? null,
    name: student?.name ?? latestEnrollment?.fullName ?? "Student",
    email: normalizedEmail,
    whatsapp: student?.phone ?? latestEnrollment?.whatsapp ?? "—",
    fatherName: latestEnrollment?.fatherName ?? null,
    cnic: latestEnrollment?.cnic ?? null,
    institution: latestEnrollment?.institution ?? null,
    classSemester: latestEnrollment?.classSemester ?? null,
    fieldOfStudy: latestEnrollment?.fieldOfStudy ?? null,
    programSlug,
    course,
    module: student?.level ?? approvedEnrollment?.level ?? latestEnrollment?.level ?? null,
    batch: student?.batch ?? approvedEnrollment?.batch ?? latestEnrollment?.batch ?? null,
    isActive: student ? student.isActive : null,
    hasPortalAccount: Boolean(student),
    firstLoginAt: student?.firstLoginAt?.toISOString() ?? null,
    lastLoginAt: student?.lastLoginAt?.toISOString() ?? null,
    joinedAt: student?.createdAt.toISOString() ?? null,
    loginUrl: getPortalLoginUrl(),
    password: null,
    hasStoredPassword: Boolean(
      focusedEnrollment?.portalPasswordEnc ?? approvedEnrollment?.portalPasswordEnc
    ),
    trainer,
    enrollments: enrollments.map((e) =>
      mapEnrollment(e, reviewerNameById, applicationNumberById.get(e.id) ?? 1)
    ),
    attendance: {
      total: present + late,
      present,
      late,
      recent: attendanceRows,
    },
  };
}

export async function getAdminStudentProfile(input: {
  studentId?: string;
  email?: string;
  enrollmentId?: string;
}): Promise<AdminStudentProfile | null> {
  const studentId = input.studentId?.trim();
  const email = input.email?.trim();
  const enrollmentId = input.enrollmentId?.trim();

  if (enrollmentId) {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) return null;
    return buildProfileForEmail(enrollment.email, enrollmentId);
  }

  if (studentId) {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== "student") return null;
    return buildProfileForEmail(student.email);
  }

  if (email) {
    return buildProfileForEmail(email);
  }

  return null;
}
