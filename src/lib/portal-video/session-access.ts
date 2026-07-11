import type { LiveSession } from "@/types/portal";
import type { PortalUser } from "@/types/portal";
import type { LiveRoomRole } from "@/lib/portal-video/config";
import { isPortalRoomSession } from "@/lib/portal-video/config";
import { canAdminWrite, isAdminRole } from "@/lib/auth/admin-roles";
import { canStudentAccessModuleContent } from "@/lib/modules/student-module-content";

export function resolveLiveSessionAccess(
  session: LiveSession,
  user: PortalUser
): { allowed: boolean; role: LiveRoomRole; error?: string } {
  if (!isPortalRoomSession(session)) {
    return { allowed: false, role: "student", error: "This class uses an external meeting link." };
  }

  if (isAdminRole(user.role) && canAdminWrite(user.role)) {
    return { allowed: true, role: "admin" };
  }

  if (user.role === "trainer") {
    if (session.trainerId !== user.id) {
      return { allowed: false, role: "host", error: "You can only host your own classes." };
    }
    return { allowed: true, role: "host" };
  }

  if (user.role === "student") {
    if (session.programSlug !== user.programSlug) {
      return { allowed: false, role: "student", error: "This class is not for your program." };
    }
    if (
      !canStudentAccessModuleContent(session.programSlug, user.level, session.level, {
        email: user.email,
      })
    ) {
      return {
        allowed: false,
        role: "student",
        error: "This class is not for your module.",
      };
    }
    return { allowed: true, role: "student" };
  }

  return { allowed: false, role: "student", error: "Unauthorized" };
}
