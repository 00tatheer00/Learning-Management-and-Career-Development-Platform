import { PortalPageHeader } from "@/components/portal/portal-ui";
import { StudentWhatsAppGroupCard } from "@/components/portal/student-whatsapp-group-card";

export default function StudentWhatsAppPage() {
  return (
    <div>
      <PortalPageHeader
        title="WhatsApp Group"
        description="Join the official class group for live links, videos, and announcements."
      />

      <StudentWhatsAppGroupCard variant="page" />
    </div>
  );
}
