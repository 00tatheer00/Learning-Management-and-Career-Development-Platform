import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * GET — Admin fetches support tickets with optional filters and pagination
 */
export async function GET(request: Request) {
  const user = await getAdminUser(request);
  if (!user) return unauthorizedAdminResponse();

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(url.searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
    );

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

    const skip = (page - 1) * limit;

    const [tickets, totalCount, stats] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
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

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          tickets,
          stats: statsSummary,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      })
    );
  } catch (error) {
    console.error("[ADMIN_SUPPORT_FETCH]", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to fetch tickets" }),
      { status: 500 }
    );
  }
}

