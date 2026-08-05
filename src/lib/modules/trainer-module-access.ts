import { getProgramBySlug } from "@/lib/data/programs";

export interface TrainerModuleOption {
  id: string;
  name: string;
  isAll?: boolean;
}

/**
 * Returns available modules for a trainer based on their assigned program.
 * Includes an "All Modules (Overview)" option.
 */
export function getTrainerAvailableModules(programSlug?: string | null): TrainerModuleOption[] {
  const slug = programSlug?.trim() || "web-development";
  const program = getProgramBySlug(slug);

  const modules: TrainerModuleOption[] = [
    { id: "all", name: "All Modules (Overview)", isAll: true },
  ];

  if (program && program.modules && program.modules.length > 0) {
    program.modules.forEach((mod) => {
      modules.push({
        id: mod.name,
        name: mod.name,
      });
    });
  } else {
    // Fallback standard module options if program has no static modules
    modules.push(
      { id: "HTML & CSS", name: "HTML & CSS" },
      { id: "JavaScript", name: "JavaScript" },
      { id: "React", name: "React" },
      { id: "Backend + Database", name: "Backend + Database" }
    );
  }

  return modules;
}

/**
 * Resolves active module string for a trainer.
 * Returns "all" or specific module name.
 */
export function resolveActiveTrainerModule(
  userLevel?: string | null,
  programSlug?: string | null
): string {
  if (!userLevel || userLevel.trim() === "" || userLevel.trim().toLowerCase() === "all") {
    return "all";
  }
  return userLevel.trim();
}

/**
 * Generates a Prisma filter object based on the active module.
 * If activeModule is "all" or empty, returns an empty object (no filter).
 * Otherwise returns { [fieldName]: activeModule }.
 */
export function buildTrainerModuleFilter<T extends Record<string, unknown>>(
  activeModule?: string | null,
  fieldName: string = "level"
): T {
  if (!activeModule || activeModule === "all" || activeModule.trim() === "") {
    return {} as T;
  }
  return { [fieldName]: activeModule.trim() } as T;
}
