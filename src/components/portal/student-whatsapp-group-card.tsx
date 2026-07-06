import { WhatsappLogo, ChatsCircle } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  STUDENT_WHATSAPP_GROUP_NAME,
  STUDENT_WHATSAPP_GROUP_URL,
} from "@/lib/constants/contact";
import { cn } from "@/lib/utils";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

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
              {STUDENT_UR.whatsappCard.joinTitle(STUDENT_WHATSAPP_GROUP_NAME)}
            </h2>
            <p className={cn("text-muted leading-relaxed", isBanner ? "text-sm sm:text-base mt-1" : "mb-6")}>
              {isBanner ? STUDENT_UR.whatsappCard.bannerDesc : STUDENT_UR.whatsappCard.pageDesc}
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
            {STUDENT_UR.whatsappCard.joinButton}
          </a>
        </Button>
      </div>

      {!isBanner && (
        <>
          <div className="space-y-3 text-left mb-8 mt-8">
            {STUDENT_UR.whatsappCard.bullets.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm">
                <ChatsCircle size={20} weight="duotone" className="text-[#25D366] shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted">{STUDENT_UR.whatsappCard.footer}</p>
        </>
      )}
    </div>
  );
}
