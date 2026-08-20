interface PasswordResetNoticeInput {
  fullName: string;
  email: string;
  password: string;
}

export async function sendPasswordResetNotifications(
  input: PasswordResetNoticeInput
): Promise<{ warnings: string[] }> {
  void input;
  return { warnings: [] };
}
