import { getEnrollmentById } from "@/lib/api/portal-data";
import { getProgramBySlug } from "@/lib/data/programs";
import {
  buildApprovalTemplatePreview,
  type ApprovalTemplateParams,
} from "@/lib/notifications/approval-templates";
import { sendApprovalWhatsApp } from "@/lib/notifications/whatsapp";
import { prisma } from "@/lib/prisma";
import { getPortalLoginUrl } from "@/lib/site-url";

export async function resendEnrollmentApprovalWhatsApp(enrollmentId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment) {
    return { success: false, message: "", error: "Enrollment not found" };
  }
  if (enrollment.status !== "approved") {
    return { success: false, message: "", error: "Enrollment is not approved" };
  }

  const courseName = getProgramBySlug(enrollment.program)?.title ?? enrollment.program;
  const firstName = enrollment.fullName.split(" ")[0] ?? enrollment.fullName;
  const params: ApprovalTemplateParams = {
    firstName,
    courseName,
    module: enrollment.level,
    portalLoginUrl: getPortalLoginUrl(),
  };

  const result = await sendApprovalWhatsApp(enrollment.whatsapp, {
    params,
    loggedBody: buildApprovalTemplatePreview(params),
  });

  if (!result.sent) {
    return {
      success: false,
      message: "",
      error:
        result.error ??
        "Approval WhatsApp template not sent — create eest_registration_approved in Meta first.",
    };
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      approvalWhatsAppSent: true,
      approvalWhatsAppError: null,
    },
  });

  return {
    success: true,
    message: `Approval info sent on WhatsApp to ${enrollment.whatsapp}.`,
  };
}
