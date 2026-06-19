import { randomBytes } from "crypto";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generateStudentPassword(length = 8): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join("");
}
