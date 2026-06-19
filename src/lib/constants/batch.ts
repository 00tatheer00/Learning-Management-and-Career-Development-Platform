import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

export const DEFAULT_BATCH_NAME = "Batch 1";

export function getBatchForProgram(programSlug: string): string {
  if (ENROLLABLE_PROGRAM_SLUGS.includes(programSlug as (typeof ENROLLABLE_PROGRAM_SLUGS)[number])) {
    return DEFAULT_BATCH_NAME;
  }
  return DEFAULT_BATCH_NAME;
}
