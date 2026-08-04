import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import {
  getFirstModuleName,
  isFirstModuleStudent,
  resolveActiveStudentModule,
} from "@/lib/modules/student-module-access";
import {
  MODULE_CONTENT_LOCKED_MESSAGE,
  MODULE_CONTENT_LOCKED_SHORT,
} from "@/lib/modules/module-content-messages";

export { MODULE_CONTENT_LOCKED_MESSAGE, MODULE_CONTENT_LOCKED_SHORT };

export interface StudentModuleContentContext {
  programSlug: string;
  programSlugs?: string[];
  studentLevel: string | null;
  approvedLevels: string[];
  /** Approved levels keyed by programSlug for per-program filtering. */
  approvedLevelsByProgram?: Record<string, string[]>;
  email?: string | null;
}

export function resolveContentModuleLevel(
  programSlug: string,
  contentLevel?: string | null
): string | null {
  const trimmed = contentLevel?.trim();
  if (trimmed) return trimmed;
  return getFirstModuleName(programSlug);
}

export function getStudentActiveModule(
  programSlug: string,
  studentLevel?: string | null,
  approvedLevels?: string[]
): string | null {
  if (approvedLevels?.length) {
    return resolveActiveStudentModule(programSlug, studentLevel, approvedLevels);
  }
  return studentLevel?.trim() || null;
}

export function canStudentAccessModuleContent(
  programSlug: string,
  studentLevel: string | null | undefined,
  contentLevel: string | null | undefined,
  options?: { email?: string | null; approvedLevels?: string[] }
): boolean {
  if (isDemoPortalStudent(options?.email)) return true;

  const resolvedContent = resolveContentModuleLevel(programSlug, contentLevel);
  if (!resolvedContent) return false;

  const enrolled = new Set(
    [...(options?.approvedLevels ?? []), studentLevel ?? ""]
      .map((level) => level?.trim())
      .filter(Boolean)
  );

  if (!enrolled.has(resolvedContent)) {
    return false;
  }

  const activeLevel = studentLevel?.trim();
  if (activeLevel && enrolled.has(activeLevel)) {
    return resolvedContent === activeLevel;
  }

  return true;
}

export function filterByStudentModule<T>(
  items: T[],
  context: StudentModuleContentContext,
  getLevel: (item: T) => string | null | undefined,
  getProgramSlug?: (item: T) => string | undefined
): T[] {
  if (isDemoPortalStudent(context.email)) return items;

  const enrolledSlugs = new Set(
    context.programSlugs && context.programSlugs.length > 0
      ? context.programSlugs
      : [context.programSlug]
  );

  return items.filter((item) => {
    // If the item has a programSlug, it must belong to one of the student's enrolled programs
    const itemProgram = getProgramSlug?.(item);
    if (itemProgram && !enrolledSlugs.has(itemProgram)) {
      return false;
    }

    // Use program-specific approved levels for the item's program
    const programForLevels = itemProgram ?? context.programSlug;
    const programApprovedLevels =
      context.approvedLevelsByProgram?.[programForLevels] ?? context.approvedLevels;

    return canStudentAccessModuleContent(
      programForLevels,
      context.studentLevel,
      getLevel(item),
      {
        email: context.email,
        approvedLevels: programApprovedLevels,
      }
    );
  });
}

export function studentHasModuleLiveContent(
  context: StudentModuleContentContext,
  sessions?: Array<{ level?: string | null }>
): boolean {
  if (isDemoPortalStudent(context.email)) return true;

  const activeLevel = context.studentLevel?.trim();
  if (!activeLevel) return true;

  // Module 1 (e.g. HTML & CSS) is always active/live for enrolled students
  if (isFirstModuleStudent(context.programSlug, activeLevel)) {
    return true;
  }

  // Any module the student is approved for has tracking & access enabled
  const normalizedApproved = (context.approvedLevels ?? []).map((l) => l.trim().toLowerCase());
  if (normalizedApproved.length > 0 && normalizedApproved.includes(activeLevel.toLowerCase())) {
    return true;
  }

  if (sessions?.length) {
    return filterByStudentModule(sessions, context, (session) => session.level).length > 0;
  }

  return false;
}
