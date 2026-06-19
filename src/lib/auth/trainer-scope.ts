import { getProgramBySlug } from "@/lib/data/programs";
import type { PortalUser } from "@/types/portal";

export function getTrainerDesignation(programSlug?: string): string {
  switch (programSlug) {
    case "web-development":
      return "Web Development Trainer";
    case "app-development":
      return "Mobile App Development Trainer";
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

export function filterStudentsByProgram<T extends { programSlug?: string }>(
  students: T[],
  programSlug: string
): T[] {
  return students.filter((s) => s.programSlug === programSlug);
}
