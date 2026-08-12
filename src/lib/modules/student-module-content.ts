import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import {
  getFirstModuleName,
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

export function normalizeModuleName(name?: string | null): string {
  if (!name) return "";
  return name.trim().toLowerCase().replace(/\s+/g, " ");
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

  const rawContentLevel = contentLevel?.trim();
  const contentNormalized = rawContentLevel
    ? normalizeModuleName(rawContentLevel)
    : normalizeModuleName(getFirstModuleName(programSlug));

  if (!contentNormalized) return false;

  const normalizedApprovedList = (options?.approvedLevels ?? [])
    .map(normalizeModuleName)
    .filter(Boolean);

  const activeLevelNormalized = studentLevel?.trim()
    ? normalizeModuleName(studentLevel)
    : normalizedApprovedList[0] || "";

  const enrolledSet = new Set(
    [...normalizedApprovedList, activeLevelNormalized].filter(Boolean)
  );

  if (!enrolledSet.has(contentNormalized)) {
    return false;
  }

  if (activeLevelNormalized && enrolledSet.has(activeLevelNormalized)) {
    return contentNormalized === activeLevelNormalized;
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

  const normalizedApproved = (context.approvedLevels ?? []).map((l) => l.trim().toLowerCase());
  if (normalizedApproved.length > 0 && normalizedApproved.includes(activeLevel.toLowerCase())) {
    return true;
  }

  if (sessions?.length) {
    return filterByStudentModule(sessions, context, (session) => session.level).length > 0;
  }

  return false;
}
