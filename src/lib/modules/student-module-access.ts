import { getProgramBySlug } from "@/lib/data/programs";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";

export function getFirstModuleName(programSlug: string): string | null {
  return getProgramBySlug(programSlug)?.modules[0]?.name ?? null;
}

export function getProgramModuleNames(programSlug: string): string[] {
  return getProgramBySlug(programSlug)?.modules.map((mod) => mod.name) ?? [];
}

export function resolveActiveStudentModule(
  programSlug: string,
  userLevel: string | null | undefined,
  approvedLevels: string[]
): string | null {
  const order = getProgramModuleNames(programSlug);
  if (order.length === 0) {
    return userLevel?.trim() || approvedLevels[0] || null;
  }

  const enrolled = new Set(
    [...approvedLevels, userLevel ?? ""].map((level) => level.trim()).filter(Boolean)
  );

  for (const moduleName of order) {
    if (enrolled.has(moduleName)) {
      return moduleName;
    }
  }

  return userLevel?.trim() || approvedLevels[0] || null;
}

export function isFirstModuleStudent(programSlug: string, level?: string | null): boolean {
  const firstModule = getFirstModuleName(programSlug);
  if (!firstModule) return true;
  if (!level?.trim()) return false;
  return level.trim() === firstModule;
}

export function canAccessModuleOneClasses(
  programSlug: string,
  level?: string | null,
  approvedLevels?: string[],
  email?: string | null
): boolean {
  if (isDemoPortalStudent(email)) return true;

  const activeLevel = approvedLevels?.length
    ? resolveActiveStudentModule(programSlug, level, approvedLevels)
    : level;
  return isFirstModuleStudent(programSlug, activeLevel);
}

export const MODULE_ONE_ACTIVE_NOTE =
  "Live classes and recordings are currently for Module 1 students only.";

export const MODULE_STARTS_SOON_MESSAGE =
  "Your module will start soon — next month. We will notify you on WhatsApp when your batch begins.";
