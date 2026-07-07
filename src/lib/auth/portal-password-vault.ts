import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { prisma } from "@/lib/prisma";

const ALGORITHM = "aes-256-gcm";
const KEY_SALT = "eest-portal-password-vault";

function getEncryptionKey(): Buffer {
  const portalSecret = process.env.PORTAL_PASSWORD_SECRET?.trim();
  const fallback = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && !portalSecret) {
    throw new Error("PORTAL_PASSWORD_SECRET is required in production");
  }
  const secret = portalSecret ?? fallback;
  if (!secret) {
    throw new Error("PORTAL_PASSWORD_SECRET, NEXTAUTH_SECRET, or AUTH_SECRET is required");
  }
  return scryptSync(secret, KEY_SALT, 32);
}

export function encryptPortalPassword(plainPassword: string): string {
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainPassword, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptPortalPassword(stored: string | null | undefined): string | null {
  if (!stored) return null;
  try {
    const [ivB64, tagB64, dataB64] = stored.split(":");
    if (!ivB64 || !tagB64 || !dataB64) return null;
    const key = getEncryptionKey();
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

export async function savePortalPasswordForStudentEmail(
  email: string,
  plainPassword: string
): Promise<boolean> {
  try {
    const portalPasswordEnc = encryptPortalPassword(plainPassword);
    await prisma.enrollment.updateMany({
      where: {
        email: email.toLowerCase(),
        status: "approved",
      },
      data: { portalPasswordEnc },
    });
    return true;
  } catch (error) {
    console.error("Failed to save portal password for email:", email, error);
    return false;
  }
}

export async function savePortalPasswordForEnrollment(
  enrollmentId: string,
  plainPassword: string
): Promise<boolean> {
  try {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { portalPasswordEnc: encryptPortalPassword(plainPassword) },
    });
    return true;
  } catch (error) {
    console.error("Failed to save portal password for enrollment:", enrollmentId, error);
    return false;
  }
}
