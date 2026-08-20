export interface NewRegistrationAlertInput {
  fullName: string;
  email: string;
  phone?: string;
  program: string;
  level: string;
  batch: string;
  institution: string;
  createdAt: string;
  enrollmentId: string;
  applicationNumber?: number;
  isReturningApplicant?: boolean;
}

export async function sendAdminNewRegistrationAlert(
  input: NewRegistrationAlertInput
): Promise<{ sent: boolean; warnings: string[] }> {
  void input;
  return { sent: true, warnings: [] };
}
