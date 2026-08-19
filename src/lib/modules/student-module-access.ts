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
  const trimmedUserLevel = userLevel?.trim();
  const lowerUserLevel = trimmedUserLevel?.toLowerCase();
  const normalizedApproved = approvedLevels.map((l) => l.trim()).filter(Boolean);
  const enrolledLowerSet = new Set(normalizedApproved.map((l) => l.toLowerCase()));

  const order = getProgramModuleNames(programSlug);

  // 1. If student's set level is valid & approved, honor it
  if (trimmedUserLevel && lowerUserLevel && enrolledLowerSet.has(lowerUserLevel)) {
    const matchedInOrder = order.find((m) => m.toLowerCase() === lowerUserLevel);
    return matchedInOrder ?? trimmedUserLevel;
  }

  if (order.length === 0) {
    return trimmedUserLevel || normalizedApproved[0] || null;
  }

  // 2. Fall back to the first approved module in program progression order
  for (const moduleName of order) {
    if (enrolledLowerSet.has(moduleName.toLowerCase())) {
      return moduleName;
    }
  }

  return trimmedUserLevel || normalizedApproved[0] || null;
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
  "Live classes and recordings are active for enrolled students.";

export const MODULE_STARTS_SOON_MESSAGE =
  "Your classes will start soon. We will notify you on WhatsApp when your next session begins.";
