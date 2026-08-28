import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue/email-queue";
import { createApiResponse } from "@/lib/api/enrollment";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET?.trim();

    // CRON_SECRET is required — deny if not configured or mismatched
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        createApiResponse(false, { error: "Unauthorized cron request" }),
        { status: 401 }
      );
    }

    const now = new Date();

    // 1. Delete expired PasswordResetTokens
    const expiredTokensResult = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // 2. Clean completed / old email queue jobs older than 1 hour
    emailQueue.purgeOldJobs(3600000);

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          expiredTokensCleaned: expiredTokensResult.count,
          emailQueueStats: emailQueue.getStats(),
          timestamp: now.toISOString(),
        },
      })
    );
  } catch (error) {
    console.error("[Maintenance Cron] Error executing maintenance:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Maintenance run failed" }),
      { status: 500 }
    );
  }
}
