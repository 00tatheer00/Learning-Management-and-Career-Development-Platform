import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/services/notification-service";

export const dynamic = "force-dynamic";

const ticketUpdateSchema = z.object({
  adminReply: z.string().max(5000).optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

/**
 * PATCH — Admin updates a support ticket (reply, status, priority)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const user = await getAdminUser(request);
  if (!user) return unauthorizedAdminResponse();

  try {
    const { ticketId } = await params;
    const body = await request.json();
    const parsed = ticketUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        createApiResponse(false, { error: parsed.error.issues[0]?.message ?? "Invalid input" }),
        { status: 400 }
      );
    }
    const { adminReply, status, priority } = parsed.data;

    // Check ticket exists
    const existing = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!existing) {
      return NextResponse.json(
        createApiResponse(false, { error: "Ticket not found" }),
        { status: 404 }
      );
    }

    // Build update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (adminReply !== undefined) {
      updateData.adminReply = adminReply.trim();
    }
    if (status) {
      updateData.status = status;
      if (status === "resolved" || status === "closed") {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = user.name;
      }
    }
    if (priority) {
      updateData.priority = priority;
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // If ticket is resolved/closed, notify the student
    if (status === "resolved" || status === "closed") {
      await createNotification({
        userId: existing.studentId,
        title: `Ticket ${existing.ticketNumber} Resolved`,
        message: `Your support ticket "${existing.subject}" has been resolved. ${adminReply ? "Admin replied to your ticket." : ""}`,
        type: "success",
        linkUrl: "/student/support",
      });
    } else if (status === "in_progress" && existing.status === "open") {
      // Notify student that their ticket is being looked at
      await createNotification({
        userId: existing.studentId,
        title: `Ticket ${existing.ticketNumber} In Progress`,
        message: `Your support ticket "${existing.subject}" is now being reviewed.`,
        type: "info",
        linkUrl: "/student/support",
      });
    }

    return NextResponse.json(
      createApiResponse(true, { data: updated, message: "Ticket updated successfully" })
    );
  } catch (error) {
    console.error("[ADMIN_SUPPORT_UPDATE]", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to update ticket" }),
      { status: 500 }
    );
  }
}
