import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createNotification,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/services/notification-service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe("notification-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a notification with default properties", async () => {
    const mockCreated = {
      id: "notif_1",
      userId: "user_123",
      title: "New Class Scheduled",
      message: "Your React lecture begins at 7 PM",
      type: "class",
      linkUrl: "/student/classes",
      isRead: false,
      createdAt: new Date(),
    };

    (prisma.notification.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreated);

    const result = await createNotification({
      userId: "user_123",
      title: "New Class Scheduled",
      message: "Your React lecture begins at 7 PM",
      type: "class",
      linkUrl: "/student/classes",
    });

    expect(result.id).toBe("notif_1");
    expect(result.type).toBe("class");
    expect(prisma.notification.create).toHaveBeenCalled();
  });

  it("fetches user notifications", async () => {
    const mockList = [
      { id: "notif_1", title: "Note 1" },
      { id: "notif_2", title: "Note 2" },
    ];
    (prisma.notification.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockList);

    const result = await getUserNotifications("user_123", 10);
    expect(result).toHaveLength(2);
    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: "user_123" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  });

  it("fetches user unread count correctly", async () => {
    (prisma.notification.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(3);

    const count = await getUnreadNotificationCount("user_123");
    expect(count).toBe(3);
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
        isRead: false,
      },
    });
  });

  it("marks a single notification as read", async () => {
    (prisma.notification.updateMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 });

    const res = await markNotificationAsRead("notif_1", "user_123");
    expect(res.count).toBe(1);
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: {
        id: "notif_1",
        userId: "user_123",
      },
      data: {
        isRead: true,
      },
    });
  });

  it("marks all notifications as read", async () => {
    (prisma.notification.updateMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 5 });

    const res = await markAllNotificationsAsRead("user_123");
    expect(res.count).toBe(5);
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  });
});
