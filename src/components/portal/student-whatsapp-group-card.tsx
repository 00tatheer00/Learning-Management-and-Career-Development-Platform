import { WhatsappLogo } from "@phosphor-icons/react/ssr";
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
        "portal-card rounded-2xl border border-pt h-full flex flex-col",
        isBanner ? "p-5 sm:p-6" : "p-6 sm:p-10 text-center max-w-xl mx-auto",
        className
      )}
    >
      {isBanner ? (
        <>
          <div className="flex gap-4 items-start flex-1 min-w-0">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <WhatsappLogo size={26} weight="fill" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-pt text-base sm:text-lg">
                {STUDENT_UR.whatsappCard.joinTitle(STUDENT_WHATSAPP_GROUP_NAME)}
              </h2>
              <p className="text-pt-muted leading-relaxed text-sm mt-1">
                {STUDENT_UR.whatsappCard.bannerDesc}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="student-whatsapp-btn mt-5 w-full h-12 font-semibold border-0 shadow-md shadow-primary/20"
            asChild
          >
            <a href={STUDENT_WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer">
              <WhatsappLogo size={20} weight="fill" />
              {STUDENT_UR.whatsappCard.joinButton}
            </a>
          </Button>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <WhatsappLogo size={36} weight="fill" />
            </div>
            <div className="text-center">
              <h2 className="font-semibold text-pt text-2xl mb-3">
                {STUDENT_UR.whatsappCard.joinTitle(STUDENT_WHATSAPP_GROUP_NAME)}
              </h2>
              <p className="text-pt-muted leading-relaxed text-sm mb-6">
                {STUDENT_UR.whatsappCard.pageDesc}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="student-whatsapp-btn w-full h-12 font-semibold border-0 shadow-md shadow-primary/20"
            asChild
          >
            <a href={STUDENT_WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer">
              <WhatsappLogo size={20} weight="fill" />
              {STUDENT_UR.whatsappCard.joinButton}
            </a>
          </Button>

          <ul className="space-y-2.5 text-left mb-8 mt-8 text-sm text-pt-muted">
            {STUDENT_UR.whatsappCard.bullets.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-pt-faint">{STUDENT_UR.whatsappCard.footer}</p>
        </>
      )}
    </div>
  );
}
