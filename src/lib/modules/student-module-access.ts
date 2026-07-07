import { getProgramBySlug } from "@/lib/data/programs";

export function getFirstModuleName(programSlug: string): string | null {
  return getProgramBySlug(programSlug)?.modules[0]?.name ?? null;
}

export function getProgramModuleNames(programSlug: string): string[] {
  return getProgramBySlug(programSlug)?.modules.map((mod) => mod.name) ?? [];
}

export function isFirstModuleStudent(programSlug: string, level?: string | null): boolean {
  const firstModule = getFirstModuleName(programSlug);
  if (!firstModule) return true;
  if (!level?.trim()) return false;
  return level.trim() === firstModule;
}

export function canAccessModuleOneClasses(programSlug: string, level?: string | null): boolean {
  return isFirstModuleStudent(programSlug, level);
}

export const MODULE_ONE_ACTIVE_NOTE =
  "Live classes and recordings are currently for Module 1 students only.";

export const MODULE_STARTS_SOON_MESSAGE =
  "Your module will start soon — next month, InshAllah. We will notify you on WhatsApp when your batch begins.";
