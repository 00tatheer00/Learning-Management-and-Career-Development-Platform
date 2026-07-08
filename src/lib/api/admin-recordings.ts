import { getClassRecordings } from "@/lib/api/class-recordings";
import { getClassProgress } from "@/lib/class-schedule";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramBySlug } from "@/lib/data/programs";
import type { ClassRecordingRecord } from "@/lib/api/class-recordings";

type ClassProgress = ReturnType<typeof getClassProgress>;

export interface AdminProgramRecordings {
  programSlug: string;
  courseTitle: string;
  recordings: ClassRecordingRecord[];
  progress: ClassProgress;
}

export async function getAdminRecordingsByProgram(): Promise<AdminProgramRecordings[]> {
  return Promise.all(
    ENROLLABLE_PROGRAM_SLUGS.map(async (programSlug) => {
      const [recordings, progress] = await Promise.all([
        getClassRecordings(programSlug),
        Promise.resolve(getClassProgress(programSlug)),
      ]);

      return {
        programSlug,
        courseTitle: getProgramBySlug(programSlug)?.title ?? programSlug,
        recordings,
        progress,
      };
    })
  );
}
