import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createCipheriv, randomBytes, scryptSync } from "crypto";

const VAULT_SALT = "eest-portal-password-vault";
const LEGACY_SALT = "eest-portal-password";

function encryptWith(secret: string, salt: string, delimiter: ":" | "."): string {
  const key = scryptSync(secret, salt, 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update("StudentPass1", "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(
    delimiter
  );
}

describe("portal-password-vault", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.PORTAL_PASSWORD_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    process.env.AUTH_SECRET = "auth-secret-for-tests";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("decrypts passwords encrypted with AUTH_SECRET before PORTAL_PASSWORD_SECRET existed", async () => {
    const stored = encryptWith("auth-secret-for-tests", VAULT_SALT, ":");
    process.env.PORTAL_PASSWORD_SECRET = "new-portal-secret";

    const { decryptPortalPassword } = await import("@/lib/auth/portal-password-vault");
    expect(decryptPortalPassword(stored)).toBe("StudentPass1");
  });

  it("decrypts legacy dot-separated payloads encrypted with AUTH_SECRET", async () => {
    const stored = encryptWith("auth-secret-for-tests", LEGACY_SALT, ".");
    process.env.PORTAL_PASSWORD_SECRET = "new-portal-secret";

    const { decryptPortalPassword } = await import("@/lib/auth/portal-password-vault");
    expect(decryptPortalPassword(stored)).toBe("StudentPass1");
  });

  it("encrypts in production using AUTH_SECRET when PORTAL_PASSWORD_SECRET is missing", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.PORTAL_PASSWORD_SECRET;
    process.env.AUTH_SECRET = "auth-secret-for-tests";

    const { encryptPortalPassword, decryptPortalPassword } = await import(
      "@/lib/auth/portal-password-vault"
    );

    const stored = encryptPortalPassword("PortalPass99");
    expect(decryptPortalPassword(stored)).toBe("PortalPass99");

    process.env.NODE_ENV = previousNodeEnv;
  });

  it("round-trips encrypt and decrypt with the active secret", async () => {
    process.env.PORTAL_PASSWORD_SECRET = "portal-secret-for-tests";
    const { encryptPortalPassword, decryptPortalPassword } = await import(
      "@/lib/auth/portal-password-vault"
    );

    const stored = encryptPortalPassword("PortalPass99");
    expect(decryptPortalPassword(stored)).toBe("PortalPass99");
  });
});
