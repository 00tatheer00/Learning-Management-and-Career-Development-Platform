import { prisma } from "@/lib/prisma";
import {
  getProgramCategory,
  isEnrollableProgramSlug,
} from "@/lib/constants/program-categories";

export function normalizeProgramSlug(rawSlug?: string | null): string {
  if (!rawSlug) return "web-development";
  const lower = rawSlug.trim().toLowerCase();
  if (lower.includes("web")) return "web-development";
  if (lower.includes("app") || lower.includes("flutter")) return "app-development";
  if (lower.includes("ai") || lower.includes("artificial") || lower.includes("intelligence")) return "artificial-intelligence";
  if (lower.includes("marketing") || lower.includes("digital") || lower.includes("seo") || lower.includes("smm")) return "digital-marketing";
  return lower;
}

export async function resolveTrainerIdForProgram(
  programSlug: string
): Promise<string | undefined> {
  const normSlug = normalizeProgramSlug(programSlug);
  if (!isEnrollableProgramSlug(normSlug)) return undefined;

  const dbTrainer = await prisma.user.findFirst({
    where: { role: "trainer", programSlug: normSlug, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (dbTrainer) {
    return dbTrainer.trainerId ?? dbTrainer.id;
  }

  return getProgramCategory(normSlug)?.primaryTrainerSeedId;
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
  const normSlug = normalizeProgramSlug(programSlug);
  const trainerId = await resolveTrainerIdForProgram(normSlug);
  return { programSlug: normSlug, level, batch, trainerId };
}
