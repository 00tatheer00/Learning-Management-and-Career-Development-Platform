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

  return enrolled.has(resolvedContent);
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
  sessions: Array<{ level?: string | null }>
): boolean {
  if (isDemoPortalStudent(context.email)) return true;
  return filterByStudentModule(sessions, context, (session) => session.level).length > 0;
}
