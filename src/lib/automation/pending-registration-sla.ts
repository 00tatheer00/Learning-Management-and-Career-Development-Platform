import { prisma } from "@/lib/prisma";
import { sendOnce } from "@/lib/automation/send-log";
import { sendAdminAutomationAlert } from "@/lib/automation/admin-alert";
import { getProgramBySlug } from "@/lib/data/programs";

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export async function runPendingRegistrationSla(now = new Date()): Promise<boolean> {
  const cutoff = new Date(now.getTime() - FORTY_EIGHT_HOURS_MS);
  const pending = await prisma.enrollment.findMany({
    where: {
      status: "pending",
      createdAt: { lte: cutoff },
    },
    orderBy: { createdAt: "asc" },
    select: {
      fullName: true,
      program: true,
      createdAt: true,
    },
  });

  if (pending.length === 0) return false;

  const dateKey = now.toISOString().slice(0, 10);
  const result = await sendOnce(
    `pending_sla_digest:${dateKey}`,
    "pending_registration_sla",
    async () => {
      const lines = pending.slice(0, 15).map((row) => {
        const course = getProgramBySlug(row.program)?.title ?? row.program;
        const days = Math.floor(
          (now.getTime() - row.createdAt.getTime()) / (24 * 60 * 60 * 1000)
        );
        return `• ${row.fullName} — ${course} (${days}d pending)`;
      });

      const message = [
        "⏳ *Pending Registrations — 48+ Hours*",
        "",
        `${pending.length} registration(s) waiting for review:`,
        "",
        ...lines,
        pending.length > 15 ? `\n…and ${pending.length - 15} more` : "",
        "",
        "Admin → Registrations to approve/reject.",
        "",
        "— EEST Portal",
      ]
        .filter(Boolean)
        .join("\n");

      const sent = await sendAdminAutomationAlert(message);
      return { sent };
    }
  );

  return result.sent;
}
