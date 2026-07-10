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

  return (
    <div className={cn("flex wa-animate-in", outbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[min(85%,420px)] px-2.5 pt-1.5 pb-1 shadow-sm wa-message-bubble",
          outbound ? "wa-bubble-out" : "wa-bubble-in"
        )}
      >
        <p className="whitespace-pre-wrap break-words text-[14.2px] leading-[19px] text-[#111b21] pr-1">
          {message.body}
        </p>
        <div className="flex items-end justify-end gap-1 -mt-0.5 ml-6 min-h-[15px]">
          {message.optimistic && (
            <span className="text-[10px] text-[#667781] italic">Sending…</span>
          )}
          <span className="text-[11px] text-[#667781] leading-none pb-0.5">
            {formatAppliedTime(message.createdAt)}
          </span>
          {outbound && !message.optimistic && (
            <WhatsAppMessageTicks
              status={message.status}
              readAt={message.readAt}
              deliveredAt={message.deliveredAt}
              variant="wa"
            />
          )}
          {outbound && message.optimistic && (
            <span className="text-[#8696a0] text-[10px]">🕐</span>
          )}
        </div>
        {outbound && message.status === "failed" && message.statusError && (
          <p className="text-[11px] text-[#ea0038] mt-1 font-medium leading-snug">
            {formatWhatsAppDeliveryError(message.statusError)}
          </p>
        )}
      </div>
    </div>
  );
}
