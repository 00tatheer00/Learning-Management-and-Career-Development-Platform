import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { EventEmitter } from "events";

export type NotificationType = "info" | "success" | "warning" | "class" | "assignment";

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  linkUrl?: string;
}

// In-process event emitter for Server-Sent Events (SSE)
class NotificationEventEmitter extends EventEmitter {}
export const notificationEvents = new NotificationEventEmitter();

/**
 * Creates a notification in DB and dispatches a live real-time event to active SSE streams.
 */
export async function createNotification(input: CreateNotificationInput) {
  const id = `notif_${crypto.randomUUID()}`;
  const notification = await prisma.notification.create({
    data: {
      id,
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type ?? "info",
      linkUrl: input.linkUrl,
      isRead: false,
      createdAt: new Date(),
    },
  });

  // Dispatch to active real-time SSE connections
  notificationEvents.emit(`user:${input.userId}`, notification);

  return notification;
}

/**
 * Get recent notifications for a user
 */
export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      isRead: true,
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}
