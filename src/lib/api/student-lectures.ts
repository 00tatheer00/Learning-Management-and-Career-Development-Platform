import "server-only";

import { prisma } from "@/lib/prisma";
import {
  filterByStudentModule,
  type StudentModuleContentContext,
} from "@/lib/modules/student-module-content";

export interface StudentLectureRecord {
  id: string;
  title: string;
  description: string;
  bunnyVideoId: string | null;
  duration: number | null;
  order: number;
  programSlug: string;
  level: string | null;
}

export async function getLecturesByProgram(programSlug: string): Promise<StudentLectureRecord[]> {
  const lectures = await prisma.lecture.findMany({
    where: {
      programSlug,
      bunnyVideoId: { not: null },
    },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      bunnyVideoId: true,
      duration: true,
      order: true,
      programSlug: true,
      level: true,
    },
  });

  return lectures;
}

export async function getWatchProgressMap(
  userId: string,
  lectureIds: string[]
): Promise<Record<string, { watchedSeconds: number; completed: boolean }>> {
  if (lectureIds.length === 0) return {};

  const rows = await prisma.watchProgress.findMany({
    where: {
      userId,
      lectureId: { in: lectureIds },
    },
    select: {
      lectureId: true,
      watchedSeconds: true,
      completed: true,
    },
  });

  return Object.fromEntries(
    rows.map((row) => [
      row.lectureId,
      { watchedSeconds: row.watchedSeconds, completed: row.completed },
    ])
  );
}

export function filterLecturesForStudent(
  lectures: StudentLectureRecord[],
  context: StudentModuleContentContext
): StudentLectureRecord[] {
  return filterByStudentModule(lectures, context, (lecture) => lecture.level, (lecture) => lecture.programSlug);
}
