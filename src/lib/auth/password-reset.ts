import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { encryptPortalPassword } from "@/lib/auth/portal-password-vault";

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

  // Update student password hash for login
  await prisma.user.update({
    where: { email: record.email },
    data: { passwordHash },
  });

  // Encrypt and update the password in the admin-visible vault (Enrollments)
  try {
    const encryptedPassword = encryptPortalPassword(newPassword);
    await prisma.enrollment.updateMany({
      where: {
        email: record.email.toLowerCase().trim(),
        status: "approved",
      },
      data: {
        portalPasswordEnc: encryptedPassword,
      },
    });
  } catch (error) {
    console.error("Failed to sync reset password to enrollment vault:", error);
  }

  await prisma.passwordResetToken.delete({ where: { id: record.id } });

  return { success: true };
}

export function getPasswordResetUrl(token: string): string {
  const base = (process.env.NEXTAUTH_URL ?? "https://school.emergingedge.tech").replace(/\/$/, "");
  return `${base}/reset-password?token=${token}`;
}
