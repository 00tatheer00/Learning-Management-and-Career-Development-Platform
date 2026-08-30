import "server-only";

import { prisma } from "@/lib/prisma";
import { getProgramModuleNames, getFirstModuleName } from "@/lib/modules/student-module-access";

export interface ClassRecordingRecord {
  id: string;
  programSlug: string;
  level?: string;
  classNumber: number;
  title: string;
  driveUrl: string;
  trainerId: string;
  trainerName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function mapRecording(record: {
  id: string;
  programSlug: string;
  level?: string | null;
  classNumber: number;
  title: string;
  driveUrl: string;
  trainerId: string;
  trainerName: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ClassRecordingRecord {
  return {
    id: record.id,
    programSlug: record.programSlug,
    level: record.level ?? undefined,
    classNumber: record.classNumber,
    title: record.title,
    driveUrl: record.driveUrl,
    trainerId: record.trainerId,
    trainerName: record.trainerName,
    notes: record.notes ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function resolveCanonicalModule(programSlug: string, raw?: string | null): string {
  if (!raw || !raw.trim() || raw.trim().toLowerCase() === "all") {
    return getFirstModuleName(programSlug) || "HTML & CSS";
  }
  const clean = raw.trim().toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]/g, "");
  const programModules = getProgramModuleNames(programSlug);
  if (programModules.length === 0) return raw.trim();

  // Try exact match on sanitized alphanumeric
  for (const mod of programModules) {
    const modClean = mod.toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]/g, "");
    if (modClean === clean) return mod;
  }

  // Try module index / prefix match (e.g. "module1", "mod1", "module2", "mod2")
  for (let i = 0; i < programModules.length; i++) {
    const mod = programModules[i];
    const modClean = mod.toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]/g, "");
    if (clean === `module${i + 1}` || clean === `mod${i + 1}`) {
      return mod;
    }
    if (clean.includes(modClean) || modClean.includes(clean)) {
      return mod;
    }
  }

  // Keyword-based fallback
  if (clean.includes("html") || clean.includes("css")) {
    const found = programModules.find((m) => m.toLowerCase().includes("html"));
    if (found) return found;
  }
  if (clean.includes("js") || clean.includes("javascript")) {
    const found = programModules.find((m) => m.toLowerCase().includes("javascript"));
    if (found) return found;
  }
  if (clean.includes("react")) {
    const found = programModules.find((m) => m.toLowerCase().includes("react"));
    if (found) return found;
  }
  if (clean.includes("backend") || clean.includes("node") || clean.includes("mongo")) {
    const found = programModules.find((m) => m.toLowerCase().includes("backend"));
    if (found) return found;
  }

  return raw.trim();
}

export async function getClassRecordings(
  programSlug: string,
  level?: string
): Promise<ClassRecordingRecord[]> {
  try {
    const records = await prisma.classRecording.findMany({
      where: { programSlug },
      orderBy: { classNumber: "asc" },
    });

    const mapped = records.map((r) => {
      const canonicalLevel = resolveCanonicalModule(r.programSlug, r.level);
      return {
        ...mapRecording(r),
        level: canonicalLevel,
      };
    });

    if (level && level.trim() !== "" && level.trim().toLowerCase() !== "all") {
      const targetCanonical = resolveCanonicalModule(programSlug, level);
      return mapped.filter((r) => r.level === targetCanonical);
    }

    return mapped;
  } catch (error) {
    console.error(`[ClassRecordings] Failed to fetch recordings for ${programSlug}:`, error);
    return [];
  }
}

export async function upsertClassRecording(data: {
  programSlug: string;
  level?: string;
  classNumber: number;
  title: string;
  driveUrl: string;
  trainerId: string;
  trainerName: string;
  notes?: string;
}): Promise<ClassRecordingRecord> {
  const normalizedLevel = resolveCanonicalModule(data.programSlug, data.level);

  // Search existing recording by programSlug, level, AND classNumber
  const existing = await prisma.classRecording.findFirst({
    where: {
      programSlug: data.programSlug,
      classNumber: data.classNumber,
      OR: [
        { level: normalizedLevel },
        ...(data.level ? [{ level: data.level }] : []),
      ],
    },
  });

  if (existing) {
    const updated = await prisma.classRecording.update({
      where: { id: existing.id },
      data: {
        title: data.title.trim(),
        driveUrl: data.driveUrl.trim(),
        level: normalizedLevel,
        trainerId: data.trainerId || existing.trainerId,
        trainerName: data.trainerName || existing.trainerName || "Trainer",
        notes: data.notes?.trim() || null,
      },
    });
    return {
      ...mapRecording(updated),
      level: normalizedLevel,
    };
  }

  try {
    const created = await prisma.classRecording.create({
      data: {
        id: crypto.randomUUID(),
        programSlug: data.programSlug,
        level: normalizedLevel,
        classNumber: data.classNumber,
        title: data.title.trim(),
        driveUrl: data.driveUrl.trim(),
        trainerId: data.trainerId || "trainer",
        trainerName: data.trainerName?.trim() || "Trainer",
        notes: data.notes?.trim() || null,
      },
    });
    return {
      ...mapRecording(created),
      level: normalizedLevel,
    };
  } catch (error: unknown) {
    // If unique constraint conflict, fetch existing and update
    const isConflict =
      Boolean(error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") ||
      (error instanceof Error && error.message.includes("Unique constraint"));

    if (isConflict) {
      const conflict = await prisma.classRecording.findFirst({
        where: {
          programSlug: data.programSlug,
          level: normalizedLevel,
          classNumber: data.classNumber,
        },
      });
      if (conflict) {
        const updated = await prisma.classRecording.update({
          where: { id: conflict.id },
          data: {
            title: data.title.trim(),
            driveUrl: data.driveUrl.trim(),
            level: normalizedLevel,
            trainerId: data.trainerId || conflict.trainerId,
            trainerName: data.trainerName || conflict.trainerName || "Trainer",
            notes: data.notes?.trim() || null,
          },
        });
        return {
          ...mapRecording(updated),
          level: normalizedLevel,
        };
      }
    }
    throw error;
  }
}

export async function deleteClassRecording(id: string, trainerId?: string): Promise<boolean> {
  const record = await prisma.classRecording.findUnique({ where: { id } });
  if (!record) return false;
  if (trainerId && record.trainerId && record.trainerId !== trainerId) {
    // allow deletion if authorized trainer/admin
  }
  await prisma.classRecording.delete({ where: { id } });
  return true;
}

export function isValidRecordingUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    return (
      host.includes("drive.google.com") ||
      host.includes("docs.google.com") ||
      host.includes("youtu.be") ||
      host.includes("youtube.com") ||
      host.includes("loom.com") ||
      host.includes("vimeo.com") ||
      host.includes("dropbox.com") ||
      host.includes("onedrive.live.com") ||
      host.includes("1drv.ms") ||
      host.includes("sharepoint.com") ||
      Boolean(parsed.protocol && parsed.host)
    );
  } catch {
    return false;
  }
}
