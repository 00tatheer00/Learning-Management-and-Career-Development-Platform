import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canAdminWrite } from "@/lib/auth/admin-roles";
import { getLiveSessionById } from "@/lib/api/portal-data";
import { PortalLiveRoom } from "@/components/portal/portal-live-room";
import { isPortalRoomSession } from "@/lib/portal-video/config";

export default async function AdminLiveClassJoinPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !canAdminWrite(user.role)) {
    redirect("/admin/live-classes");
  }

  const { sessionId } = await params;
  const session = await getLiveSessionById(sessionId);

  if (!session || !isPortalRoomSession(session)) {
    redirect("/admin/live-classes");
  }

  return (
    <PortalLiveRoom
      sessionId={session.id}
      sessionTitle={session.title}
      role="admin"
      backHref="/admin/live-classes"
    />
  );
}
