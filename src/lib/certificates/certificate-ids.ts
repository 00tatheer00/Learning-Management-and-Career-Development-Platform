import { createHash } from "crypto";

export function getProgramCode(programSlug: string): string {
  const norm = programSlug.toLowerCase();
  if (norm.includes("web")) return "WEB";
  if (norm.includes("app") || norm.includes("flutter")) return "APP";
  if (norm.includes("ai") || norm.includes("artificial")) return "AI";
  return "DEV";
}

export function getModuleCode(moduleName: string): string {
  const norm = moduleName.toLowerCase();
  if (norm.includes("html") || norm.includes("dart") || norm.includes("launchpad") || norm.includes("module 1")) return "M1";
  if (norm.includes("javascript") || norm.includes("flutter frontend") || norm.includes("data") || norm.includes("module 2")) return "M2";
  if (norm.includes("react") || norm.includes("firebase") || norm.includes("generative") || norm.includes("module 3")) return "M3";
  if (norm.includes("backend") || norm.includes("database") || norm.includes("module 4")) return "M4";
  return "M1";
}

export function buildCertificateId(
  studentId: string,
  programSlug: string,
  moduleName: string,
  indexNumber: number = 1
): string {
  const yearShort = new Date().getFullYear().toString().slice(-2);
  const progCode = getProgramCode(programSlug);
  const modCode = getModuleCode(moduleName);

  const numPadded = indexNumber.toString().padStart(4, "0");
  const digest = createHash("sha256")
    .update(`${studentId}:${programSlug}:${moduleName}`)
    .digest("hex")
    .slice(0, 3)
    .toUpperCase();

  return `EEST${yearShort}-${progCode}-${modCode}-${numPadded}`;
}

export function formatCertificateDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
