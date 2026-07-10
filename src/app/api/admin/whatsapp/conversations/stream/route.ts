import { getAdminUser } from "@/lib/auth/admin-access";
import { getWhatsAppInboxSnapshot } from "@/lib/api/whatsapp-crm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_MS = 3_000;
const MAX_MS = 55_000;

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return new Response("Unauthorized", { status: 403 });
  }

  const encoder = new TextEncoder();
  let lastFingerprint = "";
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const closeStream = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        clearTimeout(maxTimer);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      const push = (payload: object) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const tick = async () => {
        if (closed) return;
        try {
          const data = await getWhatsAppInboxSnapshot();
          const fingerprint = `${data.totalUnread}:${data.conversations
            .map((item) => `${item.id}:${item.unreadCount}:${item.lastMessageAt ?? ""}`)
            .join("|")}`;

          if (fingerprint !== lastFingerprint) {
            lastFingerprint = fingerprint;
            push({ type: "update", totalUnread: data.totalUnread, conversations: data.conversations });
          } else {
            push({ type: "heartbeat", totalUnread: data.totalUnread });
          }
        } catch {
          push({ type: "error" });
        }
      };

      void tick();
      const interval = setInterval(() => void tick(), POLL_MS);
      const maxTimer = setTimeout(closeStream, MAX_MS);

      request.signal.addEventListener("abort", closeStream);
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
