import { createHash } from "crypto";

export function buildCertificateId(
  studentId: string,
  programSlug: string,
  moduleName: string
): string {
  const programCode = programSlug === "app-development" ? "AD" : "WD";
  const digest = createHash("sha256")
    .update(`${studentId}:${programSlug}:${moduleName}`)
    .digest("hex")
    .slice(0, 4)
    .toUpperCase();
  const year = new Date().getFullYear();
  return `EEST-${programCode}-${year}-${digest}`;
}

export function formatCertificateDate(date: Date): string {
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-GB", { month: "long", timeZone: "UTC" }).toUpperCase();
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}
