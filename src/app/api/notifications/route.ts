import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/services/notification-service";
import { createApiResponse } from "@/lib/api/enrollment";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createApiResponse(false, { error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(session.user.id, limit),
      getUnreadNotificationCount(session.user.id),
    ]);

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          notifications,
          unreadCount,
        },
      })
    );
  } catch (error) {
    console.error("[Notifications API] Error fetching notifications:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to fetch notifications" }),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createApiResponse(false, { error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll) {
      await markAllNotificationsAsRead(session.user.id);
      return NextResponse.json(createApiResponse(true, { message: "All marked as read" }));
    }

    if (notificationId && typeof notificationId === "string") {
      await markNotificationAsRead(notificationId, session.user.id);
      return NextResponse.json(createApiResponse(true, { message: "Marked as read" }));
    }

    return NextResponse.json(
      createApiResponse(false, { error: "Invalid notification parameters" }),
      { status: 400 }
    );
  } catch (error) {
    console.error("[Notifications API] Error updating notifications:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to update notification" }),
      { status: 500 }
    );
  }
}
