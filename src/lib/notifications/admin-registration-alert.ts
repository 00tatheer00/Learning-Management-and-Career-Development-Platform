export interface NewRegistrationAlertInput {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  batch: string;
  institution: string;
  createdAt: string;
  enrollmentId: string;
  applicationNumber?: number;
  isReturningApplicant?: boolean;
}

/** Admin registration WhatsApp alerts disabled. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendAdminNewRegistrationAlert(
  _input: NewRegistrationAlertInput
): Promise<{ whatsappSent: boolean; warnings: string[] }> {
  return { whatsappSent: false, warnings: [] };
}
