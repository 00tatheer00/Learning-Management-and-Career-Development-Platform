import { getProgramBySlug } from "@/lib/data/programs";

export interface ModuleStudentGroup<T> {
  moduleName: string;
  subtitle?: string;
  duration?: string;
  students: T[];
}

export function groupStudentsByModule<T extends { level?: string; name?: string }>(
  students: T[],
  programSlug: string
): ModuleStudentGroup<T>[] {
  const program = getProgramBySlug(programSlug);
  const catalogModules = program?.modules ?? [];
  const order = catalogModules.map((mod) => mod.name);

  const buckets = new Map<string, T[]>();
  for (const name of order) {
    buckets.set(name, []);
  }

  const extras = new Map<string, T[]>();

  for (const student of students) {
    const level = student.level?.trim();
    if (!level) {
      const list = buckets.get("__unassigned__") ?? [];
      list.push(student);
      buckets.set("__unassigned__", list);
      continue;
    }
    if (buckets.has(level)) {
      buckets.get(level)!.push(student);
    } else {
      const list = extras.get(level) ?? [];
      list.push(student);
      extras.set(level, list);
    }
  }

  const groups: ModuleStudentGroup<T>[] = [];

  for (const mod of catalogModules) {
    const list = buckets.get(mod.name) ?? [];
    if (list.length === 0) continue;
    groups.push({
      moduleName: mod.name,
      subtitle: mod.subtitle,
      duration: mod.duration,
      students: list.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0),
    });
  }

  for (const [name, list] of extras) {
    if (list.length === 0) continue;
    groups.push({
      moduleName: name,
      students: list.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0),
    });
  }

  const unassigned = buckets.get("__unassigned__") ?? [];
  if (unassigned.length > 0) {
    groups.push({
      moduleName: "Module not set",
      subtitle: "Students without a module assigned yet",
      students: unassigned.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0),
    });
  }

  return groups;
}

export function getModuleFilterOptions(
  groups: ModuleStudentGroup<unknown>[]
): Array<{ name: string; count: number }> {
  return groups.map((group) => ({
    name: group.moduleName,
    count: group.students.length,
  }));
}
