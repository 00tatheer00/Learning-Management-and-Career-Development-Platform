import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { prisma } from "@/lib/prisma";

const ALGORITHM = "aes-256-gcm";
const VAULT_KEY_SALT = "eest-portal-password-vault";
const LEGACY_KEY_SALT = "eest-portal-password";

function deriveKey(secret: string, salt: string): Buffer {
  return scryptSync(secret, salt, 32);
}

function getAuthSecret(): string | null {
  return process.env.NEXTAUTH_SECRET?.trim() ?? process.env.AUTH_SECRET?.trim() ?? null;
}

function getPrimarySecret(): string {
  const portalSecret = process.env.PORTAL_PASSWORD_SECRET?.trim();
  const authSecret = getAuthSecret();
  if (process.env.NODE_ENV === "production" && !portalSecret) {
    throw new Error("PORTAL_PASSWORD_SECRET is required in production");
  }
  const secret = portalSecret ?? authSecret;
  if (!secret) {
    throw new Error("PORTAL_PASSWORD_SECRET, NEXTAUTH_SECRET, or AUTH_SECRET is required");
  }
  return secret;
}

function getEncryptionKey(): Buffer {
  return deriveKey(getPrimarySecret(), VAULT_KEY_SALT);
}

function decryptWithKey(
  stored: string,
  key: Buffer,
  delimiter: ":" | "."
): string | null {
  try {
    const [ivB64, tagB64, dataB64] = stored.split(delimiter);
    if (!ivB64 || !tagB64 || !dataB64) return null;
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

function getDecryptCandidates(stored: string): Array<{ key: Buffer; delimiter: ":" | "." }> {
  const candidates: Array<{ key: Buffer; delimiter: ":" | "." }> = [];
  const seen = new Set<string>();

  const addCandidate = (secret: string, salt: string, delimiter: ":" | ".") => {
    const signature = `${secret}:${salt}:${delimiter}`;
    if (seen.has(signature)) return;
    seen.add(signature);
    candidates.push({ key: deriveKey(secret, salt), delimiter });
  };

  const portalSecret = process.env.PORTAL_PASSWORD_SECRET?.trim();
  const authSecret = getAuthSecret();

  if (portalSecret) {
    addCandidate(portalSecret, VAULT_KEY_SALT, ":");
  }
  if (authSecret) {
    addCandidate(authSecret, VAULT_KEY_SALT, ":");
    addCandidate(authSecret, LEGACY_KEY_SALT, ".");
    addCandidate(authSecret, LEGACY_KEY_SALT, ":");
  }

  const delimiter: ":" | "." = stored.includes(".") && !stored.includes(":") ? "." : ":";
  if (candidates.length === 0) {
    try {
      candidates.push({ key: getEncryptionKey(), delimiter });
    } catch {
      return [];
    }
  }

  return candidates;
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

  for (const candidate of getDecryptCandidates(stored)) {
    const password = decryptWithKey(stored, candidate.key, candidate.delimiter);
    if (password) return password;
  }

  return null;
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
