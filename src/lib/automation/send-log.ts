import { prisma } from "@/lib/prisma";

export async function hasAutomationBeenSent(key: string): Promise<boolean> {
  const existing = await prisma.automationSendLog.findUnique({
    where: { key },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function markAutomationSent(key: string, type: string): Promise<void> {
  try {
    await prisma.automationSendLog.create({
      data: {
        id: crypto.randomUUID(),
        key,
        type,
      },
    });
  } catch {
    // Another cron run may have inserted the same key.
  }
}

export async function sendOnce(
  key: string,
  type: string,
  send: () => Promise<{ sent: boolean }>
): Promise<{ skipped: boolean; sent: boolean }> {
  if (await hasAutomationBeenSent(key)) {
    return { skipped: true, sent: false };
  }

  const result = await send();
  if (result.sent) {
    await markAutomationSent(key, type);
  }

  return { skipped: false, sent: result.sent };
}
