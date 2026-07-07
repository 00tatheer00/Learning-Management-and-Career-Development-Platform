/** Google Drive sharing limits (see Google Drive Help). */

export const DRIVE_SHARE_LIMITS = {
  /** Max individual emails on one file (Google official). */
  maxEmailsPerFile: 600,
  /** Safe batch size for one “Add people” paste — UI often fails above this. */
  recommendedPasteBatch: 40,
  /** Max sharing invitations per day (Google). */
  maxInvitesPerDay: 1500,
} as const;

export const DRIVE_SHARE_LIMITS_SUMMARY = `Google Drive allows up to ${DRIVE_SHARE_LIMITS.maxEmailsPerFile} people per file total. Paste about ${DRIVE_SHARE_LIMITS.recommendedPasteBatch} emails at a time in Share → Add people, then repeat for each batch.`;

export function formatEmailsForDriveShare(emails: string[]): string {
  return emails.join(", ");
}

export function chunkEmailsForDriveShare(
  emails: string[],
  batchSize: number = DRIVE_SHARE_LIMITS.recommendedPasteBatch
): string[][] {
  if (batchSize <= 0) return emails.length ? [emails] : [];
  const chunks: string[][] = [];
  for (let i = 0; i < emails.length; i += batchSize) {
    chunks.push(emails.slice(i, i + batchSize));
  }
  return chunks;
}

export function getDriveBatchLabel(batchIndex: number, totalBatches: number, count: number): string {
  return `Batch ${batchIndex + 1} of ${totalBatches} · ${count} email${count === 1 ? "" : "s"}`;
}
