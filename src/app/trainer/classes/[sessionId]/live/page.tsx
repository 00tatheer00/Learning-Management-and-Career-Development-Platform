import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveSessionById } from "@/lib/api/portal-data";
import { PortalLiveRoom } from "@/components/portal/portal-live-room";
import { isPortalRoomSession } from "@/lib/livekit/config";

export default async function TrainerLiveClassPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    redirect("/login");
  }

  const { sessionId } = await params;
  const session = await getLiveSessionById(sessionId);

  if (!session || !isPortalRoomSession(session)) {
    redirect("/trainer/classes");
  }

  if (session.trainerId !== (user.trainerId ?? user.id)) {
    redirect("/trainer/classes");
  }

  return (
    <PortalLiveRoom
      sessionId={session.id}
      sessionTitle={session.title}
      role="host"
      backHref="/trainer/classes"
    />
  );
}
