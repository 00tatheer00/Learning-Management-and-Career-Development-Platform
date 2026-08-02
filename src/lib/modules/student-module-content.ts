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
  studentLevel: string | null;
  approvedLevels: string[];
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
  getLevel: (item: T) => string | null | undefined
): T[] {
  if (isDemoPortalStudent(context.email)) return items;

  return items.filter((item) =>
    canStudentAccessModuleContent(context.programSlug, context.studentLevel, getLevel(item), {
      email: context.email,
      approvedLevels: context.approvedLevels,
    })
  );
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
