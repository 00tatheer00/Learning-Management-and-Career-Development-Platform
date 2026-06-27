import { NextResponse } from "next/server";
import { runAllAutomations } from "@/lib/automation/run-automation";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  return request.headers.get("x-cron-secret") === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runAllAutomations();
    console.info("[cron/automation]", JSON.stringify(summary));
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    console.error("[cron/automation] failed:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Automation failed" },
      { status: 500 }
    );
  }
}
