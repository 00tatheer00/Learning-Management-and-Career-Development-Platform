import { PortalPageHeader } from "@/components/portal/portal-ui";
import { StudentWhatsAppGroupCard } from "@/components/portal/student-whatsapp-group-card";

export default function StudentWhatsAppPage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Community"
        title="WhatsApp Group"
        description="Join the official class group for live links, videos, and announcements."
      />

      <StudentWhatsAppGroupCard variant="page" />
    </div>
  );
}
