import { getProgramBySlug } from "@/lib/data/programs";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";

export function getFirstModuleName(programSlug: string): string | null {
  return getProgramBySlug(programSlug)?.modules[0]?.name ?? null;
}

export function getProgramModuleNames(programSlug: string): string[] {
  return getProgramBySlug(programSlug)?.modules.map((mod) => mod.name) ?? [];
}

export function resolveCanonicalModule(programSlug: string, raw?: string | null): string {
  if (!raw || !raw.trim() || raw.trim().toLowerCase() === "all") {
    return getFirstModuleName(programSlug) || "HTML & CSS";
  }
  const clean = raw.trim().toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]/g, "");
  const programModules = getProgramModuleNames(programSlug);
  if (programModules.length === 0) return raw.trim();

  // 1. Exact match on sanitized alphanumeric
  for (const mod of programModules) {
    const modClean = mod.toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]/g, "");
    if (modClean === clean) return mod;
  }

  // 2. Module index / prefix match (e.g. "1st module", "module1", "mod1", "phase1", "level1")
  for (let i = 0; i < programModules.length; i++) {
    const mod = programModules[i];
    const modClean = mod.toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]/g, "");
    const idx = i + 1;
    if (
      clean === `module${idx}` ||
      clean === `mod${idx}` ||
      clean === `phase${idx}` ||
      clean === `level${idx}` ||
      clean === `${idx}stmodule` ||
      clean === `${idx}ndmodule` ||
      clean === `${idx}rdmodule` ||
      clean === `${idx}thmodule` ||
      clean.startsWith(`module${idx}`) ||
      clean.startsWith(`mod${idx}`) ||
      clean.startsWith(`phase${idx}`)
    ) {
      return mod;
    }
    if (clean.includes(modClean) || modClean.includes(clean)) {
      return mod;
    }
  }

  // 3. Keyword-based matching
  if (clean.includes("html") || clean.includes("css") || clean.includes("beginner") || clean.includes("first")) {
    const found = programModules.find((m) => m.toLowerCase().includes("html"));
    if (found) return found;
  }
  if (clean.includes("js") || clean.includes("javascript") || clean.includes("second")) {
    const found = programModules.find((m) => m.toLowerCase().includes("javascript"));
    if (found) return found;
  }
  if (clean.includes("react") || clean.includes("third") || clean.includes("frontend")) {
    const found = programModules.find((m) => m.toLowerCase().includes("react"));
    if (found) return found;
  }
  if (
    clean.includes("backend") ||
    clean.includes("database") ||
    clean.includes("node") ||
    clean.includes("mongo") ||
    clean.includes("fourth") ||
    clean.includes("last")
  ) {
    const found = programModules.find((m) => m.toLowerCase().includes("backend"));
    if (found) return found;
  }

  return raw.trim();
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
  "Your classes will start soon. Check your portal notifications for session updates.";
