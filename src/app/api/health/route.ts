import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/health — Lightweight health check for uptime monitoring.
 * Returns DB connectivity status and basic server info.
 */
export async function GET() {
  const start = Date.now();
  let dbStatus: "connected" | "error" = "error";
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    // Lightweight DB ping — just count a small collection
    await prisma.user.count({ take: 1 });
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (error) {
    console.error("[Health] DB ping failed:", error);
  }

  const healthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      server: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV ?? "unknown",
        responseMs: Date.now() - start,
      },
    },
    { status: healthy ? 200 : 503 }
  );
}
