"use client";

import { WhatsAppMessageTicks } from "@/components/admin/whatsapp-message-ticks";
import { formatWhatsAppDeliveryError } from "@/lib/whatsapp/messaging-window";
import { cn, formatAppliedTime } from "@/lib/utils";
import type { WhatsAppMessageRow } from "@/lib/api/whatsapp-crm";

export interface DisplayMessage extends WhatsAppMessageRow {
  optimistic?: boolean;
}

export function WhatsAppMessageBubble({ message }: { message: DisplayMessage }) {
  const outbound = message.direction === "outbound";
  const isImage = message.type === "image" && message.mediaId;

  return (
    <div className={cn("flex wa-animate-in", outbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[min(88%,420px)] sm:max-w-[min(85%,420px)] shadow-sm wa-message-bubble",
          isImage ? "p-1 pb-1" : "px-2.5 pt-1.5 pb-1",
          outbound ? "wa-bubble-out" : "wa-bubble-in"
        )}
      >
        {isImage && (
          <div className="relative mb-1 rounded-sm overflow-hidden bg-[#e9edef] dark:bg-[#202c33] max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/admin/whatsapp/media/${message.mediaId}`}
              alt={message.body || "WhatsApp Image"}
              className="object-cover w-full max-h-[280px] rounded-sm cursor-zoom-in hover:brightness-95 transition-all"
              onClick={() => window.open(`/api/admin/whatsapp/media/${message.mediaId}`, "_blank")}
              loading="lazy"
            />
          </div>
        )}

        {message.body && (
          <p className={cn("whitespace-pre-wrap break-words text-[14.2px] leading-[19px] text-[#111b21] pr-1", isImage && "px-1.5 pt-0.5 pb-1")}>
            {message.body}
          </p>
        )}

        <div className={cn("flex items-end justify-end gap-1 ml-6 min-h-[15px]", isImage && !message.body ? "absolute bottom-1 right-2 bg-black/40 px-1.5 py-0.5 rounded text-white shadow-sm" : "-mt-0.5")}>
          {message.optimistic && (
            <span className={cn("text-[10px] italic", isImage && !message.body ? "text-white/80" : "text-[#667781]")}>Sending…</span>
          )}
          <span className={cn("text-[11px] leading-none pb-0.5", isImage && !message.body ? "text-white" : "text-[#667781]")}>
            {formatAppliedTime(message.createdAt)}
          </span>
          {outbound && !message.optimistic && (
            <WhatsAppMessageTicks
              status={message.status}
              readAt={message.readAt}
              deliveredAt={message.deliveredAt}
              variant={isImage && !message.body ? "white" : "wa"}
            />
          )}
          {outbound && message.optimistic && (
            <span className="text-[10px]">🕐</span>
          )}
        </div>
        {outbound && message.status === "failed" && message.statusError && (
          <p className="text-[11px] text-[#ea0038] mt-1 font-medium leading-snug px-1.5">
            {formatWhatsAppDeliveryError(message.statusError)}
          </p>
        )}
      </div>
    </div>
  );
}
