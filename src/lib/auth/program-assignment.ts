import { prisma } from "@/lib/prisma";
import {
  getProgramCategory,
  isEnrollableProgramSlug,
} from "@/lib/constants/program-categories";

export async function resolveTrainerIdForProgram(
  programSlug: string
): Promise<string | undefined> {
  if (!isEnrollableProgramSlug(programSlug)) return undefined;

  const dbTrainer = await prisma.user.findFirst({
    where: { role: "trainer", programSlug, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (dbTrainer) {
    return dbTrainer.trainerId ?? dbTrainer.id;
  }

  return getProgramCategory(programSlug)?.primaryTrainerSeedId;
}

export interface StudentProgramAssignment {
  programSlug: string;
  level: string;
  batch: string;
  trainerId?: string;
}

export async function buildStudentProgramAssignment(
  programSlug: string,
  level: string,
  batch: string
): Promise<StudentProgramAssignment> {
  const trainerId = await resolveTrainerIdForProgram(programSlug);
  return { programSlug, level, batch, trainerId };
}
