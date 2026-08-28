import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET — Admin fetches all support tickets with optional filters
 */
export async function GET(request: Request) {
  const user = await getAdminUser(request);
  if (!user) return unauthorizedAdminResponse();

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }
    if (category && category !== "all") {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { studentName: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { studentEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tickets, stats] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.supportTicket.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const statsSummary = {
      total: 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };
    for (const s of stats) {
      const count = s._count.status;
      statsSummary.total += count;
      if (s.status === "open") statsSummary.open = count;
      else if (s.status === "in_progress") statsSummary.in_progress = count;
      else if (s.status === "resolved") statsSummary.resolved = count;
      else if (s.status === "closed") statsSummary.closed = count;
    }

    return NextResponse.json(
      createApiResponse(true, { data: { tickets, stats: statsSummary } })
    );
  } catch (error) {
    console.error("[ADMIN_SUPPORT_FETCH]", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to fetch tickets" }),
      { status: 500 }
    );
  }
}
