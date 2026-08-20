import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { notificationEvents } from "@/lib/services/notification-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const eventChannel = `user:${userId}`;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial keep-alive ping
      controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`));

      const onNotification = (data: unknown) => {
        try {
          const payload = JSON.stringify(data);
          controller.enqueue(encoder.encode(`event: notification\ndata: ${payload}\n\n`));
        } catch {
          // ignore serialize errors
        }
      };

      notificationEvents.on(eventChannel, onNotification);

      // Periodic 25-second keep-alive to keep connection active across proxies
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 25000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        notificationEvents.off(eventChannel, onNotification);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
