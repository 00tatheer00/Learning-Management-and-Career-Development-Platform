import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { StudentCertificatesPanel } from "@/components/portal/student-certificates-panel";
import {
  certificatesEnabledForStudent,
  getStudentCertificateModules,
} from "@/lib/certificates/student-certificates";

export default async function StudentCertificatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!certificatesEnabledForStudent(user.email)) {
    return (
      <div>
        <PortalPageHeader
          eyebrow="Achievements"
          title="Certificates"
          description="Module certificates will appear here after you complete each level."
        />
        <p className="text-sm text-pt-muted">
          Certificates are being rolled out to students module by module.
        </p>
      </div>
    );
  }

  const modules = getStudentCertificateModules(user);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Achievements"
        title="Certificates"
        description="Download a verified digital certificate for each module you complete."
      />
      <StudentCertificatesPanel modules={modules} />
    </div>
  );
}
