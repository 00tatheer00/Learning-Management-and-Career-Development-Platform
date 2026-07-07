import { prisma } from "@/lib/prisma";

export interface ClassRecordingRecord {
  id: string;
  programSlug: string;
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

export async function getClassRecordings(programSlug: string): Promise<ClassRecordingRecord[]> {
  const records = await prisma.classRecording.findMany({
    where: { programSlug },
    orderBy: { classNumber: "asc" },
  });
  return records.map(mapRecording);
}

export async function upsertClassRecording(data: {
  programSlug: string;
  classNumber: number;
  title: string;
  driveUrl: string;
  trainerId: string;
  trainerName: string;
  notes?: string;
}): Promise<ClassRecordingRecord> {
  const existing = await prisma.classRecording.findUnique({
    where: {
      programSlug_classNumber: {
        programSlug: data.programSlug,
        classNumber: data.classNumber,
      },
    },
  });

  if (existing) {
    const updated = await prisma.classRecording.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        driveUrl: data.driveUrl,
        trainerId: data.trainerId,
        trainerName: data.trainerName,
        notes: data.notes ?? null,
      },
    });
    return mapRecording(updated);
  }

  const created = await prisma.classRecording.create({
    data: {
      id: crypto.randomUUID(),
      programSlug: data.programSlug,
      classNumber: data.classNumber,
      title: data.title,
      driveUrl: data.driveUrl,
      trainerId: data.trainerId,
      trainerName: data.trainerName,
      notes: data.notes ?? null,
    },
  });
  return mapRecording(created);
}

export async function deleteClassRecording(id: string, trainerId: string): Promise<boolean> {
  const record = await prisma.classRecording.findUnique({ where: { id } });
  if (!record || record.trainerId !== trainerId) return false;
  await prisma.classRecording.delete({ where: { id } });
  return true;
}

export function isValidRecordingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return (
      host.includes("drive.google.com") ||
      host.includes("docs.google.com") ||
      host.includes("youtu.be") ||
      host.includes("youtube.com") ||
      host.includes("loom.com")
    );
  } catch {
    return false;
  }
}
