import { PortalPageHeader } from "@/components/portal/portal-ui";
import { StudentWhatsAppGroupCard } from "@/components/portal/student-whatsapp-group-card";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

export default function StudentWhatsAppPage() {
  return (
    <div>
      <PortalPageHeader
        title={STUDENT_UR.whatsappPage.title}
        description={STUDENT_UR.whatsappPage.description}
      />

      <StudentWhatsAppGroupCard variant="page" />
    </div>
  );
}
