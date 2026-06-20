import { WhatsappLogo, ChatsCircle } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  STUDENT_WHATSAPP_GROUP_NAME,
  STUDENT_WHATSAPP_GROUP_URL,
} from "@/lib/constants/contact";
import { cn } from "@/lib/utils";

interface StudentWhatsAppGroupCardProps {
  variant?: "banner" | "page";
  className?: string;
}

export function StudentWhatsAppGroupCard({
  variant = "page",
  className,
}: StudentWhatsAppGroupCardProps) {
  const isBanner = variant === "banner";

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-[#25D366]/30 bg-[#25D366]/5",
        isBanner ? "p-5 sm:p-6" : "p-6 sm:p-10 text-center max-w-xl mx-auto",
        className
      )}
    >
      <div
        className={cn(
          "flex gap-4",
          isBanner ? "flex-col sm:flex-row sm:items-center sm:justify-between" : "flex-col items-center"
        )}
      >
        <div className={cn("flex gap-4", isBanner ? "items-start sm:items-center" : "flex-col items-center")}>
          <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
            <WhatsappLogo size={isBanner ? 28 : 40} weight="fill" />
          </div>
          <div className={cn(!isBanner && "text-center")}>
            <h2 className={cn("font-bold", isBanner ? "text-lg sm:text-xl" : "text-2xl mb-3")}>
              Join {STUDENT_WHATSAPP_GROUP_NAME}
            </h2>
            <p className={cn("text-muted leading-relaxed", isBanner ? "text-sm sm:text-base mt-1" : "mb-6")}>
              {isBanner
                ? "Your registration is approved. Join the class WhatsApp group now for live links, videos, and updates."
                : "All class updates, live links, recorded lectures, and assignments are shared in our official WhatsApp group."}
            </p>
          </div>
        </div>

        <Button
          size="lg"
          className={cn(
            "h-14 text-base bg-[#25D366] hover:bg-[#20bd5a] shrink-0",
            isBanner ? "w-full sm:w-auto" : "w-full"
          )}
          asChild
        >
          <a href={STUDENT_WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={22} weight="fill" />
            Join Now — Open Group
          </a>
        </Button>
      </div>

      {!isBanner && (
        <>
          <div className="space-y-3 text-left mb-8 mt-8">
            {[
              "Live class links are posted before each session",
              "Recorded lecture videos are shared in the group",
              "Ask questions directly to your trainer",
              "Get assignment reminders and updates",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm">
                <ChatsCircle size={20} weight="duotone" className="text-[#25D366] shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted">
            Tap the button above to open WhatsApp and join the group.
          </p>
        </>
      )}
    </div>
  );
}
