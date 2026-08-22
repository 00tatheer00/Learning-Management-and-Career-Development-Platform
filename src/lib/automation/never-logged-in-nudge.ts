export async function runNeverLoggedInNudges(_now = new Date()): Promise<{
  studentNudges: number;
  adminDigestSent: boolean;
}> {
  return { studentNudges: 0, adminDigestSent: false };
}
