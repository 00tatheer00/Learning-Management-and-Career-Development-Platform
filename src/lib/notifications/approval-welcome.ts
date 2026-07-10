import { getProgramBySlug } from "@/lib/data/programs";
import {
  buildApprovalTemplatePreview,
  type ApprovalTemplateParams,
} from "@/lib/notifications/approval-templates";
import { sendApprovalWhatsApp } from "@/lib/notifications/whatsapp";

interface EnrollmentNotificationRecord {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  password: string;
}

export async function sendApprovalWelcomeNotifications(
  enrollment: EnrollmentNotificationRecord
): Promise<{ whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const courseName = getProgramBySlug(enrollment.program)?.title ?? enrollment.program;
  const firstName = enrollment.fullName.split(" ")[0] ?? enrollment.fullName;

  const params: ApprovalTemplateParams = {
    firstName,
    courseName,
    module: enrollment.level,
  };

  const whatsappResult = await sendApprovalWhatsApp(enrollment.whatsapp, {
    params,
    loggedBody: buildApprovalTemplatePreview(params),
  });

  if (!whatsappResult.sent) {
    warnings.push(
      whatsappResult.error ??
        "Approval WhatsApp template not sent — create eest_registration_approved in Meta first."
    );
  }

  return {
    whatsappSent: whatsappResult.sent,
    warnings,
  };
}
