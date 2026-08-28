import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/services/notification-service";
import { rateLimitByIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Generate a unique ticket number like TKT-0001
 */
async function generateTicketNumber(): Promise<string> {
  const lastTicket = await prisma.supportTicket.findFirst({
    orderBy: { createdAt: "desc" },
    select: { ticketNumber: true },
  });

  let nextNum = 1;
  if (lastTicket?.ticketNumber) {
    const match = lastTicket.ticketNumber.match(/TKT-(\d+)/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `TKT-${String(nextNum).padStart(4, "0")}`;
}

const VALID_CATEGORIES = [
  "login",
  "module",
  "payment",
  "assignment",
  "live-class",
  "other",
];

/**
 * POST — Submit a new support ticket (authenticated student OR guest)
 */
export async function POST(request: Request) {
  // Rate limit: 3 tickets per 5 minutes per IP (prevents guest spam)
  const isRateLimited = await rateLimitByIp(request, "support-ticket", 3, 300);
  if (isRateLimited) {
    return NextResponse.json(
      createApiResponse(false, { error: "Too many requests. Please try again later." }),
      { status: 429 }
    );
  }

  let user: { id: string; name: string; email: string } | null = null;
  try {
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.role === "student") {
      user = { id: currentUser.id, name: currentUser.name, email: currentUser.email };
    }
  } catch {
    // Not logged in — that's fine, guest submission
  }

  try {
    const body = await request.json();
    const { category, subject, description, name, email } = body as {
      category?: string;
      subject?: string;
      description?: string;
      name?: string;
      email?: string;
    };

    // For guests, name and email are required
    const studentName = user?.name || name?.trim();
    const studentEmail = user?.email || email?.trim();
    const studentId = user?.id || "guest";

    if (!studentName || studentName.length < 2) {
      return NextResponse.json(
        createApiResponse(false, { error: "Name is required" }),
        { status: 400 }
      );
    }
    if (!studentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
      return NextResponse.json(
        createApiResponse(false, { error: "Valid email is required" }),
        { status: 400 }
      );
    }

    // Validation
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        createApiResponse(false, { error: "Invalid category" }),
        { status: 400 }
      );
    }
    if (!subject || subject.trim().length < 3) {
      return NextResponse.json(
        createApiResponse(false, { error: "Subject must be at least 3 characters" }),
        { status: 400 }
      );
    }
    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Description must be at least 10 characters",
        }),
        { status: 400 }
      );
    }

    // Rate limit — max 5 open tickets per student/email
    const openCount = await prisma.supportTicket.count({
      where: {
        studentEmail,
        status: { in: ["open", "in_progress"] },
      },
    });

    if (openCount >= 5) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Maximum 5 open tickets allowed. Please wait for existing tickets to be resolved.",
        }),
        { status: 429 }
      );
    }

    const ticketNumber = await generateTicketNumber();
    const id = `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        id,
        ticketNumber,
        studentId,
        studentName,
        studentEmail,
        category: category.trim(),
        subject: subject.trim(),
        description: description.trim(),
      },
    });

    // Notify all admins about new ticket
    const admins = await prisma.user.findMany({
      where: { role: { in: ["admin", "admin_readonly"] }, isActive: true },
      select: { id: true },
    });

    const guestLabel = studentId === "guest" ? " (Guest)" : "";
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "New Support Ticket",
        message: `${studentName}${guestLabel} submitted ticket ${ticketNumber}: ${subject.trim()}`,
        type: "warning",
        linkUrl: "/admin/support",
      });
    }

    return NextResponse.json(
      createApiResponse(true, { data: { ticketNumber: ticket.ticketNumber }, message: "Ticket submitted successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("[SUPPORT_TICKET_CREATE]", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to create ticket" }),
      { status: 500 }
    );
  }
}

/**
 * GET — Student fetches their own tickets
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(
      createApiResponse(false, { error: "Unauthorized" }),
      { status: 403 }
    );
  }

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(createApiResponse(true, { data: tickets }));
  } catch (error) {
    console.error("[SUPPORT_TICKETS_FETCH]", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to fetch tickets" }),
      { status: 500 }
    );
  }
}
