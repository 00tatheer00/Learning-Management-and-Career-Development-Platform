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

function seenKey(userId: string, section: "assignments" | "classes"): string {
  return `student_portal_seen_${section}:${userId}`;
}

function sessionIsStillRelevant(startsAt: Date | null, date: string, time: string): boolean {
  const start = startsAt ?? parseSessionDateTime(date, time);
  if (!start) return true;
  const twoHoursAfterStart = start.getTime() + 2 * 60 * 60 * 1000;
  return Date.now() <= twoHoursAfterStart;
}

async function getSeenAt(userId: string, section: "assignments" | "classes"): Promise<Date> {
  const key = seenKey(userId, section);
  const log = await prisma.automationSendLog.findUnique({
    where: { key },
    select: { sentAt: true },
  });
  if (log?.sentAt) return log.sentAt;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastLoginAt: true, createdAt: true },
  });

  return user?.lastLoginAt ?? user?.createdAt ?? new Date(0);
}

export async function getStudentPortalBadgeCounts(
  user: Pick<PortalUser, "id" | "email" | "programSlug" | "level">
): Promise<StudentPortalBadgeCounts> {
  try {
    const programSlug = user.programSlug ?? "web-development";
    const context = await getStudentModuleContentContext(user);
    const [assignmentsSeenAt, classesSeenAt, allAssignments, allSessions] = await Promise.all([
      getSeenAt(user.id, "assignments"),
      getSeenAt(user.id, "classes"),
      getAssignments(programSlug),
      prisma.liveSession.findMany({
        where: { programSlug },
        select: {
          id: true,
          level: true,
          date: true,
          time: true,
          startsAt: true,
        },
      }),
    ]);

    const assignments = filterByStudentModule(allAssignments, context, (item) => item.level);
    const sessions = filterByStudentModule(allSessions, context, (session) => session.level);

    const assignmentsCount = assignments.filter(
      (assignment) => new Date(assignment.createdAt).getTime() > assignmentsSeenAt.getTime()
    ).length;

    const classesCount = sessions.filter((session) => {
      const createdAt = session.startsAt ?? parseSessionDateTime(session.date, session.time);
      if (!createdAt || createdAt.getTime() <= classesSeenAt.getTime()) return false;
      return sessionIsStillRelevant(session.startsAt, session.date, session.time);
    }).length;

    return { assignments: assignmentsCount, classes: classesCount };
  } catch (error) {
    console.error("[student-portal/badges] count failed:", error);
    return { assignments: 0, classes: 0 };
  }
}

export async function markStudentPortalSectionSeen(
  userId: string,
  section: "assignments" | "classes"
): Promise<void> {
  try {
    const key = seenKey(userId, section);
    await prisma.automationSendLog.deleteMany({ where: { key } });
    await prisma.automationSendLog.create({
      data: {
        id: crypto.randomUUID(),
        key,
        type: "student_portal_seen",
      },
    });
  } catch (error) {
    console.error("[student-portal/badges] mark seen failed:", error);
  }
}
