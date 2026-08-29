import { getProgramBySlug } from "@/lib/data/programs";
import type { PortalUser } from "@/types/portal";

export function getTrainerDesignation(programSlug?: string): string {
  switch (programSlug) {
    case "web-development":
      return "Web Development Trainer";
    case "app-development":
      return "Mobile App Development Trainer";
    case "artificial-intelligence":
      return "Associate AI Engineer & Trainer";
    case "digital-marketing":
      return "Digital Marketing & AI Trainer";
    default:
      return "Trainer";
  }
}

export function getTrainerCourseTitle(programSlug?: string): string {
  return getProgramBySlug(programSlug ?? "")?.title ?? "Course";
}

export function requireTrainerProgram(user: PortalUser): string {
  if (!user.programSlug) {
    throw new Error("TRAINER_NO_PROGRAM");
  }
  return user.programSlug;
}

export function filterByTrainerProgram<T extends { programSlug: string }>(
  items: T[],
  programSlug: string
): T[] {
  return items.filter((item) => item.programSlug === programSlug);
}

import { normalizeProgramSlug } from "@/lib/auth/program-assignment";

export function filterStudentsByProgram<T extends { programSlug?: string; level?: string }>(
  students: T[],
  programSlug: string
): T[] {
  const targetNorm = normalizeProgramSlug(programSlug);
  const program = getProgramBySlug(targetNorm);
  const catalogModuleNames = new Set(program?.modules.map((m) => m.name) ?? []);

  return students.filter((s) => {
    if (s.programSlug) {
      return normalizeProgramSlug(s.programSlug) === targetNorm;
    }
    if (s.level && catalogModuleNames.size > 0) {
      return catalogModuleNames.has(s.level.trim());
    }
    return false;
  });
}

/** Consistent trainer entity id — linked trainer profile or user account id. */
export function resolveTrainerId(user: { id: string; trainerId?: string | null }): string {
  return user.trainerId ?? user.id;
}
