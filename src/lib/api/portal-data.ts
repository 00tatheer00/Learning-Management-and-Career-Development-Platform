import { readJsonFile, writeJsonFile } from "@/lib/db/json-store";
import { getUsersByRole } from "@/lib/auth/users";
import type {
  Assignment,
  AssignmentSubmission,
  CourseMaterial,
  EnrollmentRecord,
  EnrollmentStatus,
  LiveSession,
} from "@/types/portal";
import type { EnrollmentPayload } from "@/types";

const FILES = {
  enrollments: "enrollments.json",
  materials: "materials.json",
  assignments: "assignments.json",
  submissions: "submissions.json",
  sessions: "live-sessions.json",
} as const;

const DEFAULT_MATERIALS: CourseMaterial[] = [
  {
    id: "mat-1",
    programSlug: "web-development",
    title: "HTML & CSS Basics",
    description: "Introduction to building web pages",
    type: "video",
    url: "https://www.youtube.com/watch?v=qz0aGYrrlhU",
    order: 1,
  },
  {
    id: "mat-2",
    programSlug: "web-development",
    title: "JavaScript Fundamentals",
    description: "Learn JS from scratch",
    type: "video",
    url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
    order: 2,
  },
  {
    id: "mat-3",
    programSlug: "web-development",
    title: "Practice Exercises",
    description: "Download and practice",
    type: "link",
    url: "https://www.w3schools.com/html/html_exercises.asp",
    order: 3,
  },
  {
    id: "mat-4",
    programSlug: "app-development",
    title: "Flutter Introduction",
    description: "Start mobile app development",
    type: "video",
    url: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
    order: 1,
  },
];

const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-1",
    programSlug: "web-development",
    title: "Build Your First Web Page",
    description: "Create a simple personal portfolio page using HTML and CSS.",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    trainerId: "trainer-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "asg-2",
    programSlug: "web-development",
    title: "JavaScript Calculator",
    description: "Make a basic calculator using JavaScript.",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    trainerId: "trainer-1",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_SESSIONS: LiveSession[] = [
  {
    id: "ses-1",
    programSlug: "web-development",
    title: "Live Class — HTML & CSS",
    date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    time: "07:00 PM",
    meetLink: "https://meet.google.com/eest-web-dev",
    trainerId: "trainer-1",
    trainerName: "Syed Tatheer Hussain",
    notes: "Join 5 minutes early. Keep your mic muted.",
  },
  {
    id: "ses-2",
    programSlug: "app-development",
    title: "Live Class — Flutter Setup",
    date: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
    time: "07:00 PM",
    meetLink: "https://meet.google.com/eest-flutter",
    trainerId: "trainer-1",
    trainerName: "Syed Tatheer Hussain",
  },
];

async function seedPortalDataIfNeeded() {
  const materials = await readJsonFile<CourseMaterial[]>(FILES.materials, []);
  if (materials.length === 0) await writeJsonFile(FILES.materials, DEFAULT_MATERIALS);

  const assignments = await readJsonFile<Assignment[]>(FILES.assignments, []);
  if (assignments.length === 0) await writeJsonFile(FILES.assignments, DEFAULT_ASSIGNMENTS);

  const sessions = await readJsonFile<LiveSession[]>(FILES.sessions, []);
  if (sessions.length === 0) await writeJsonFile(FILES.sessions, DEFAULT_SESSIONS);
}

export async function getEnrollments(): Promise<EnrollmentRecord[]> {
  await seedPortalDataIfNeeded();
  const records = await readJsonFile<EnrollmentRecord[]>(FILES.enrollments, []);
  return records.map((r) => ({ ...r, status: r.status ?? "pending" }));
}

export async function saveEnrollment(
  enrollment: EnrollmentPayload & { id: string; createdAt: string; paymentScreenshot?: string }
): Promise<void> {
  const enrollments = await getEnrollments();
  const record: EnrollmentRecord = { ...enrollment, status: "pending" };
  enrollments.push(record);
  await writeJsonFile(FILES.enrollments, enrollments);
}

export async function updateEnrollmentStatus(
  id: string,
  status: EnrollmentStatus,
  reviewedBy: string,
  adminNotes?: string
): Promise<EnrollmentRecord | null> {
  const enrollments = await getEnrollments();
  const index = enrollments.findIndex((e) => e.id === id);
  if (index === -1) return null;
  enrollments[index] = {
    ...enrollments[index],
    status,
    reviewedAt: new Date().toISOString(),
    reviewedBy,
    adminNotes,
  };
  await writeJsonFile(FILES.enrollments, enrollments);
  return enrollments[index];
}

export async function getMaterials(programSlug?: string): Promise<CourseMaterial[]> {
  await seedPortalDataIfNeeded();
  const materials = await readJsonFile<CourseMaterial[]>(FILES.materials, []);
  const filtered = programSlug
    ? materials.filter((m) => m.programSlug === programSlug)
    : materials;
  return filtered.sort((a, b) => a.order - b.order);
}

export async function getAssignments(programSlug?: string): Promise<Assignment[]> {
  await seedPortalDataIfNeeded();
  const assignments = await readJsonFile<Assignment[]>(FILES.assignments, []);
  return programSlug
    ? assignments.filter((a) => a.programSlug === programSlug)
    : assignments;
}

export async function createAssignment(
  data: Omit<Assignment, "id" | "createdAt">
): Promise<Assignment> {
  const assignments = await getAssignments();
  const assignment: Assignment = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  assignments.push(assignment);
  await writeJsonFile(FILES.assignments, assignments);
  return assignment;
}

export async function getSubmissions(studentId?: string): Promise<AssignmentSubmission[]> {
  await seedPortalDataIfNeeded();
  const submissions = await readJsonFile<AssignmentSubmission[]>(FILES.submissions, []);
  return studentId ? submissions.filter((s) => s.studentId === studentId) : submissions;
}

export async function createSubmission(
  data: Omit<AssignmentSubmission, "id" | "submittedAt" | "status">
): Promise<AssignmentSubmission> {
  const submissions = await getSubmissions();
  const submission: AssignmentSubmission = {
    ...data,
    id: crypto.randomUUID(),
    status: "submitted",
    submittedAt: new Date().toISOString(),
  };
  submissions.push(submission);
  await writeJsonFile(FILES.submissions, submissions);
  return submission;
}

export async function updateSubmission(
  id: string,
  updates: Partial<AssignmentSubmission>
): Promise<AssignmentSubmission | null> {
  const submissions = await getSubmissions();
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) return null;
  submissions[index] = { ...submissions[index], ...updates, reviewedAt: new Date().toISOString() };
  await writeJsonFile(FILES.submissions, submissions);
  return submissions[index];
}

export async function getLiveSessions(programSlug?: string): Promise<LiveSession[]> {
  await seedPortalDataIfNeeded();
  const sessions = await readJsonFile<LiveSession[]>(FILES.sessions, []);
  const filtered = programSlug
    ? sessions.filter((s) => s.programSlug === programSlug)
    : sessions;
  return filtered.sort((a, b) => a.date.localeCompare(b.date));
}

export async function createLiveSession(
  data: Omit<LiveSession, "id">
): Promise<LiveSession> {
  const sessions = await getLiveSessions();
  const session: LiveSession = { ...data, id: crypto.randomUUID() };
  sessions.push(session);
  await writeJsonFile(FILES.sessions, sessions);
  return session;
}

export async function getPortalStats() {
  const [enrollments, students, assignments, sessions] = await Promise.all([
    getEnrollments(),
    getUsersByRole("student"),
    getAssignments(),
    getLiveSessions(),
  ]);
  return {
    pendingEnrollments: enrollments.filter((e) => e.status === "pending").length,
    approvedEnrollments: enrollments.filter((e) => e.status === "approved").length,
    totalEnrollments: enrollments.length,
    students: students.length,
    assignments: assignments.length,
    upcomingSessions: sessions.filter((s) => s.date >= new Date().toISOString().split("T")[0]).length,
  };
}
