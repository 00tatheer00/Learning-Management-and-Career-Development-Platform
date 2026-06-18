import { WhatsappLogo, ChatsCircle, Bell } from "@phosphor-icons/react/ssr";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { HELP_CONFIG } from "@/lib/constants/help";

export default function StudentWhatsAppPage() {
  return (
    <div>
      <PortalPageHeader
        title="WhatsApp Group"
        description="All class updates, links, and announcements are shared on WhatsApp."
      />

      <div className="rounded-2xl border-2 border-[#25D366]/30 bg-[#25D366]/5 p-6 sm:p-10 text-center max-w-xl mx-auto">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#25D366] text-white mb-6">
          <WhatsappLogo size={40} weight="fill" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Join Your Class Group</h2>
        <p className="text-muted mb-6 leading-relaxed">
          After your Rs 1,000 registration is approved, you will be added to the official
          WhatsApp group. There you get live class links, recorded lectures, and assignments.
        </p>

        <div className="space-y-3 text-left mb-8">
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

        <Button size="lg" className="w-full h-14 text-base bg-[#25D366] hover:bg-[#20bd5a]" asChild>
          <a href={HELP_CONFIG.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={22} weight="fill" />
            Open WhatsApp &amp; Message Us
          </a>
        </Button>

        <p className="text-xs text-muted mt-4 flex items-center justify-center gap-1.5">
          <Bell size={14} weight="duotone" />
          Not added yet? Wait 2–3 days after registration payment.
        </p>
      </div>
    </div>
  );
}
