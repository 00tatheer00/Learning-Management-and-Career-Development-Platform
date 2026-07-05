import { prisma } from "@/lib/prisma";
import { getSessionRoomName, generateRoomPassword } from "@/lib/portal-video/config";
import { sessionHasJoinLink } from "@/lib/sessions/meet-link";
import { getAdminProgramStats } from "@/lib/api/admin-program-stats";
import { DEFAULT_BATCH_NAME } from "@/lib/constants/batch";
import type {
  Assignment,
  AssignmentSubmission,
  CourseMaterial,
  EnrollmentRecord,
  EnrollmentStatus,
  LiveSession,
  LiveSessionPublic,
} from "@/types/portal";
import type { EnrollmentPayload } from "@/types";

function stripSessionPassword(session: LiveSession): LiveSessionPublic {
  const { roomPassword: _roomPassword, ...publicSession } = session;
  return publicSession;
}

function mapEnrollment(record: {
  id: string;
  fullName: string;
  fatherName: string;
  institution: string;
  classSemester: string;
  cnic: string;
  email: string;
  whatsapp: string;
  fieldOfStudy: string;
  program: string;
  level: string;
  batch: string | null;
  learningMode: string;
  hasLaptop: string;
  internetAvailable: string;
  confirmInfoCorrect: boolean;
  agreeToPolicies: boolean;
  paymentScreenshot: string | null;
  paymentScreenshotPublicId: string | null;
  profilePhotoUrl: string | null;
  status: EnrollmentStatus;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  adminNotes: string | null;
  createdAt: Date;
}): EnrollmentRecord {
  return {
    id: record.id,
    fullName: record.fullName,
    fatherName: record.fatherName,
    institution: record.institution,
    classSemester: record.classSemester,
    cnic: record.cnic,
    email: record.email,
    whatsapp: record.whatsapp,
    fieldOfStudy: record.fieldOfStudy,
    program: record.program,
    level: record.level,
    batch: record.batch ?? DEFAULT_BATCH_NAME,
    learningMode: record.learningMode,
    hasLaptop: record.hasLaptop as "yes" | "no",
    internetAvailable: record.internetAvailable as "yes" | "no",
    confirmInfoCorrect: record.confirmInfoCorrect,
    agreeToPolicies: record.agreeToPolicies,
    paymentScreenshot: record.paymentScreenshot ?? undefined,
    status: record.status,
    reviewedAt: record.reviewedAt?.toISOString(),
    reviewedBy: record.reviewedBy ?? undefined,
    adminNotes: record.adminNotes ?? undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

export type LiveSessionPreview = Omit<LiveSessionPublic, "meetLink"> & {
  hasJoinLink: boolean;
};

export async function getEnrollmentByEmail(email: string) {
  return prisma.enrollment.findFirst({
    where: { email: email.toLowerCase() },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEnrollmentByCnic(cnic: string) {
  const normalized = cnic.replace(/[-\s]/g, "");
  return prisma.enrollment.findFirst({
    where: { cnic: normalized },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEnrollmentById(id: string) {
  return prisma.enrollment.findUnique({ where: { id } });
}

export async function getEnrollments(): Promise<EnrollmentRecord[]> {
  const records = await prisma.enrollment.findMany({
    orderBy: { createdAt: "desc" },
  });
  return records.map(mapEnrollment);
}

export async function saveEnrollment(
  enrollment: EnrollmentPayload & {
    id: string;
    createdAt: string;
    paymentScreenshot?: string;
    paymentScreenshotPublicId?: string;
  }
): Promise<void> {
  await prisma.enrollment.create({
    data: {
      id: enrollment.id,
      fullName: enrollment.fullName,
      fatherName: enrollment.fatherName,
      institution: enrollment.institution,
      classSemester: enrollment.classSemester,
      cnic: enrollment.cnic,
      email: enrollment.email.toLowerCase(),
      whatsapp: enrollment.whatsapp,
      fieldOfStudy: enrollment.fieldOfStudy,
      program: enrollment.program,
      level: enrollment.level,
      batch: enrollment.batch,
      learningMode: enrollment.learningMode,
      hasLaptop: enrollment.hasLaptop,
      internetAvailable: enrollment.internetAvailable,
      confirmInfoCorrect: enrollment.confirmInfoCorrect,
      agreeToPolicies: enrollment.agreeToPolicies,
      paymentScreenshot: enrollment.paymentScreenshot,
      paymentScreenshotPublicId: enrollment.paymentScreenshotPublicId,
      status: "pending",
      createdAt: new Date(enrollment.createdAt),
    },
  });
}

export async function updateEnrollmentStatus(
  id: string,
  status: EnrollmentStatus,
  reviewedBy: string,
  adminNotes?: string
): Promise<EnrollmentRecord | null> {
  try {
    const record = await prisma.enrollment.update({
      where: { id },
      data: {
        status,
        reviewedBy,
        adminNotes,
        reviewedAt: new Date(),
      },
    });
    return mapEnrollment(record);
  } catch {
    return null;
  }
}

export async function getMaterials(programSlug?: string): Promise<CourseMaterial[]> {
  const materials = await prisma.courseMaterial.findMany({
    where: programSlug ? { programSlug } : undefined,
    orderBy: { order: "asc" },
  });
  return materials.map((m) => ({
    id: m.id,
    programSlug: m.programSlug,
    title: m.title,
    description: m.description,
    type: m.type,
    url: m.url,
    order: m.order,
  }));
}

export async function getAssignments(programSlug?: string): Promise<Assignment[]> {
  const assignments = await prisma.assignment.findMany({
    where: programSlug ? { programSlug } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return assignments.map((a) => ({
    id: a.id,
    programSlug: a.programSlug,
    title: a.title,
    description: a.description,
    dueDate: a.dueDate,
    trainerId: a.trainerId,
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function createAssignment(
  data: Omit<Assignment, "id" | "createdAt">
): Promise<Assignment> {
  const assignment = await prisma.assignment.create({
    data: {
      id: crypto.randomUUID(),
      programSlug: data.programSlug,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      trainerId: data.trainerId,
    },
  });
  return {
    id: assignment.id,
    programSlug: assignment.programSlug,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    trainerId: assignment.trainerId,
    createdAt: assignment.createdAt.toISOString(),
  };
}

export async function getSubmissions(studentId?: string): Promise<AssignmentSubmission[]> {
  const submissions = await prisma.assignmentSubmission.findMany({
    where: studentId ? { studentId } : undefined,
    orderBy: { submittedAt: "desc" },
  });
  return submissions.map(mapSubmission);
}

export async function createSubmission(
  data: Omit<AssignmentSubmission, "id" | "submittedAt" | "status">
): Promise<AssignmentSubmission> {
  const submission = await prisma.assignmentSubmission.create({
    data: {
      id: crypto.randomUUID(),
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      studentName: data.studentName,
      content: data.content,
      status: "submitted",
    },
  });
  return mapSubmission(submission);
}

export async function updateSubmission(
  id: string,
  updates: Partial<AssignmentSubmission>
): Promise<AssignmentSubmission | null> {
  try {
    const submission = await prisma.assignmentSubmission.update({
      where: { id },
      data: {
        status: updates.status,
        feedback: updates.feedback,
        reviewedAt: new Date(),
      },
    });
    return mapSubmission(submission);
  } catch {
    return null;
  }
}

export async function getLiveSessions(programSlug?: string): Promise<LiveSessionPublic[]> {
  const sessions = await prisma.liveSession.findMany({
    where: programSlug ? { programSlug } : undefined,
    orderBy: { date: "asc" },
  });
  return sessions.map(mapLiveSession).map(stripSessionPassword);
}

export async function getLiveSessionsPreview(programSlug?: string): Promise<LiveSessionPreview[]> {
  const sessions = await getLiveSessions(programSlug);
  return sessions.map(({ meetLink: _meetLink, ...session }) => ({
    ...session,
    hasJoinLink: sessionHasJoinLink({ roomType: session.roomType, meetLink: _meetLink }),
  }));
}

export async function getLiveSessionById(id: string): Promise<LiveSession | null> {
  const session = await prisma.liveSession.findUnique({ where: { id } });
  return session ? mapLiveSession(session) : null;
}

function mapLiveSession(s: {
  id: string;
  programSlug: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
  roomType?: string | null;
  roomName?: string | null;
  roomPassword?: string | null;
  trainerId: string;
  trainerName: string;
  notes: string | null;
}): LiveSession {
  return {
    id: s.id,
    programSlug: s.programSlug,
    title: s.title,
    date: s.date,
    time: s.time,
    meetLink: s.meetLink,
    roomType: s.roomType === "portal" ? "portal" : "meet",
    roomName: s.roomName ?? undefined,
    roomPassword: s.roomPassword ?? undefined,
    trainerId: s.trainerId,
    trainerName: s.trainerName,
    notes: s.notes ?? undefined,
  };
}

export async function createLiveSession(
  data: Omit<LiveSession, "id">
): Promise<LiveSession> {
  const id = crypto.randomUUID();
  const roomType = data.roomType ?? "meet";
  const roomName = roomType === "portal" ? getSessionRoomName(id) : data.roomName;
  const roomPassword = roomType === "portal" ? generateRoomPassword() : undefined;

  const session = await prisma.liveSession.create({
    data: {
      id,
      programSlug: data.programSlug,
      title: data.title,
      date: data.date,
      time: data.time,
      meetLink: data.meetLink ?? "",
      roomType,
      roomName,
      roomPassword,
      trainerId: data.trainerId,
      trainerName: data.trainerName,
      notes: data.notes,
    },
  });
  return mapLiveSession(session);
}

export async function updateLiveSession(
  id: string,
  data: Partial<Pick<LiveSession, "title" | "date" | "time" | "meetLink" | "notes">>
): Promise<LiveSession | null> {
  try {
    const session = await prisma.liveSession.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.date !== undefined ? { date: data.date } : {}),
        ...(data.time !== undefined ? { time: data.time } : {}),
        ...(data.meetLink !== undefined ? { meetLink: data.meetLink } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });
    return mapLiveSession(session);
  } catch {
    return null;
  }
}

export async function getPortalStats() {
  const [programStats, assignments, sessions] = await Promise.all([
    getAdminProgramStats(),
    prisma.assignment.findMany(),
    prisma.liveSession.findMany(),
  ]);

  const today = new Date().toISOString().split("T")[0];

  return {
    pendingEnrollments: programStats.pendingEnrollments,
    approvedEnrollments: programStats.approvedRegistrations,
    totalEnrollments: programStats.totalEnrollments,
    students: programStats.activeStudents,
    trainerAssignedStudents: programStats.trainerAssignedStudents,
    missingTrainerAssignments: programStats.missingTrainerAssignments,
    returningRegistrations: programStats.returningRegistrations,
    assignments: assignments.length,
    upcomingSessions: sessions.filter((s) => s.date >= today).length,
  };
}

function mapSubmission(submission: {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  status: "submitted" | "approved" | "needs_revision";
  submittedAt: Date;
  feedback: string | null;
  reviewedAt: Date | null;
}): AssignmentSubmission {
  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    studentId: submission.studentId,
    studentName: submission.studentName,
    content: submission.content,
    status: submission.status,
    submittedAt: submission.submittedAt.toISOString(),
    feedback: submission.feedback ?? undefined,
    reviewedAt: submission.reviewedAt?.toISOString(),
  };
}
