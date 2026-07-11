import { describe, expect, it } from "vitest";
import { buildCertificateId, formatCertificateDate } from "@/lib/certificates/certificate-ids";

describe("certificate ids", () => {
  it("builds stable program-coded ids", () => {
    const id = buildCertificateId("student-1", "web-development", "HTML & CSS");
    expect(id).toMatch(/^EEST-WD-\d{4}-[A-F0-9]{4}$/);
    expect(buildCertificateId("student-1", "web-development", "HTML & CSS")).toBe(id);
  });

  it("formats certificate dates in uppercase month", () => {
    expect(formatCertificateDate(new Date("2026-07-11T00:00:00.000Z"))).toBe("11 JULY 2026");
  });
});
