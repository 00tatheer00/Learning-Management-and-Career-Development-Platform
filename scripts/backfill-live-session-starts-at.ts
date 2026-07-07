/**
 * Backfill LiveSession.startsAt from legacy date/time strings (Pakistan timezone).
 * Run: npx tsx scripts/backfill-live-session-starts-at.ts
 */
import { prisma } from "../src/lib/prisma";
import { buildLiveSessionTimestamps } from "../src/lib/sessions/live-session-datetime";

async function main() {
  const sessions = await prisma.liveSession.findMany();
  let updated = 0;

  for (const session of sessions) {
    if (session.startsAt) continue;

    const built = buildLiveSessionTimestamps(
      session.date,
      session.time,
      session.timezone ?? "Asia/Karachi"
    );
    if (!built) {
      console.warn(`Skip ${session.id}: invalid date/time ${session.date} ${session.time}`);
      continue;
    }

    await prisma.liveSession.update({
      where: { id: session.id },
      data: {
        startsAt: built.startsAt,
        timezone: built.timezone,
        date: built.date,
        time: built.time,
      },
    });
    updated += 1;
  }

  console.log(`Backfilled startsAt on ${updated} of ${sessions.length} live sessions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
