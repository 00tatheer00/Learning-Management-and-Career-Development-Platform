import { prisma } from "@/lib/prisma";
import { getAssignments } from "@/lib/api/portal-data";
import { parseSessionDateTime } from "@/lib/sessions/join-window";
import {
  filterByStudentModule,
  getStudentModuleContentContext,
} from "@/lib/modules/student-module-content";
import type { PortalUser } from "@/types/portal";

export interface StudentPortalBadgeCounts {
  assignments: number;
  classes: number;
}

function sessionIsStillRelevant(startsAt: Date | null, date: string, time: string): boolean {
  const start = startsAt ?? parseSessionDateTime(date, time);
  if (!start) return true;
  const twoHoursAfterStart = start.getTime() + 2 * 60 * 60 * 1000;
  return Date.now() <= twoHoursAfterStart;
}

export async function getStudentPortalBadgeCounts(
  user: Pick<PortalUser, "id" | "email" | "programSlug" | "level">
): Promise<StudentPortalBadgeCounts> {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      assignmentsSeenAt: true,
      classesSeenAt: true,
      createdAt: true,
    },
  });

  if (!dbUser) {
    return { assignments: 0, classes: 0 };
  }

  const programSlug = user.programSlug ?? "web-development";
  const context = await getStudentModuleContentContext(user);
  const assignmentsSeenAt = dbUser.assignmentsSeenAt ?? dbUser.createdAt;
  const classesSeenAt = dbUser.classesSeenAt ?? dbUser.createdAt;

  const [allAssignments, allSessions] = await Promise.all([
    getAssignments(programSlug),
    prisma.liveSession.findMany({
      where: { programSlug },
      select: {
        id: true,
        level: true,
        date: true,
        time: true,
        startsAt: true,
        createdAt: true,
      },
    }),
  ]);

  const assignments = filterByStudentModule(allAssignments, context, (item) => item.level);
  const sessions = filterByStudentModule(allSessions, context, (session) => session.level);

  const assignmentsCount = assignments.filter(
    (assignment) => new Date(assignment.createdAt).getTime() > assignmentsSeenAt.getTime()
  ).length;

  const classesCount = sessions.filter((session) => {
    const createdAt = session.createdAt ?? session.startsAt ?? parseSessionDateTime(session.date, session.time);
    if (!createdAt || createdAt.getTime() <= classesSeenAt.getTime()) return false;
    return sessionIsStillRelevant(session.startsAt, session.date, session.time);
  }).length;

  return { assignments: assignmentsCount, classes: classesCount };
}

export async function markStudentPortalSectionSeen(
  userId: string,
  section: "assignments" | "classes"
): Promise<void> {
  const now = new Date();
  await prisma.user.update({
    where: { id: userId },
    data:
      section === "assignments"
        ? { assignmentsSeenAt: now }
        : { classesSeenAt: now },
  });
}
