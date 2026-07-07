import { getCurrentUser } from "@/lib/auth/session";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { StudentRecordingsContent } from "@/components/portal/student-recordings-content";

export default async function StudentRecordingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const recordings = await getClassRecordings(programSlug);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Student Portal"
        title="Class Recordings"
        description="Rewatch completed classes. New recordings appear after your trainer uploads them."
      />
      <StudentRecordingsContent programSlug={programSlug} recordings={recordings} />
    </div>
  );
}
