import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !user.isActive) {
    return null;
  }

  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });
  await prisma.passwordResetToken.create({
    data: {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record) {
    return { success: false, error: "Invalid or expired reset link." };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return { success: false, error: "Reset link has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { email: record.email },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.delete({ where: { id: record.id } });

  return { success: true };
}

export function getPasswordResetUrl(token: string): string {
  const base = (process.env.NEXTAUTH_URL ?? "https://school.emergingedge.tech").replace(/\/$/, "");
  return `${base}/reset-password?token=${token}`;
}
