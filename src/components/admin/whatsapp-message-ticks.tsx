import type { WhatsAppMessageRow } from "@/lib/api/whatsapp-crm";
import { cn } from "@/lib/utils";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M2.5 8.2L6.1 11.8L13.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppMessageTicks({
  status,
  readAt,
  deliveredAt,
  className,
}: {
  status: WhatsAppMessageRow["status"];
  readAt?: string | null;
  deliveredAt?: string | null;
  className?: string;
}) {
  const isRead = status === "read" || Boolean(readAt);
  const isDelivered = status === "delivered" || Boolean(deliveredAt) || isRead;
  const isFailed = status === "failed";
  const isSent = status === "sent" || isDelivered;

  if (isFailed) {
    return (
      <span
        className={cn("inline-flex items-center text-red-300 text-[10px] font-bold", className)}
        title="Failed to deliver"
      >
        !
      </span>
    );
  }

  const color = isRead ? "text-sky-300" : "text-primary-foreground/55";

  return (
    <span className={cn("inline-flex items-center -space-x-1.5 ml-1", color, className)}>
      <CheckIcon />
      {(isDelivered || isSent) && (
        <CheckIcon className={isDelivered ? undefined : "opacity-70"} />
      )}
    </span>
  );
}

export function getWhatsAppStatusLabel(status: string): string | null {
  switch (status) {
    case "pending":
      return "Sending…";
    case "sent":
      return "Sent";
    case "delivered":
      return "Delivered";
    case "read":
      return "Read";
    case "failed":
      return "Failed";
    default:
      return null;
  }
}
