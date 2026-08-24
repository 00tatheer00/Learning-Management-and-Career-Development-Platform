import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/services/notification-service";
import { createApiResponse } from "@/lib/api/enrollment";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      createApiResponse(false, { error: "Unauthorized" }),
      { status: 401 }
    );
  }

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(session.user.id, 20),
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
}
