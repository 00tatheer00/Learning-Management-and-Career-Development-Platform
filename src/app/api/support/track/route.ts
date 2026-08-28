import { NextResponse } from "next/server";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET — Track tickets by email (no auth required)
 * Only returns safe fields — no internal IDs exposed
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email")?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        createApiResponse(false, { error: "Valid email is required" }),
        { status: 400 }
      );
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { studentEmail: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ticketNumber: true,
        category: true,
        subject: true,
        description: true,
        status: true,
        adminReply: true,
        attachmentUrl: true,
        resolvedAt: true,
        resolvedBy: true,
        createdAt: true,
      },
    });

    return NextResponse.json(createApiResponse(true, { data: tickets }));
  } catch (error) {
    console.error("[SUPPORT_TRACK]", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to fetch tickets" }),
      { status: 500 }
    );
  }
}
