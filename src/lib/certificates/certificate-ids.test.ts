import { describe, expect, it } from "vitest";
import { buildCertificateId, formatCertificateDate } from "@/lib/certificates/certificate-ids";

describe("certificate ids", () => {
  it("builds stable program-coded ids matching required EEST verification format", () => {
    const id = buildCertificateId("student-1", "web-development", "HTML & CSS", 1);
    expect(id).toMatch(/^EEST\d{2}-WEB-M1-\d{4}$/);
    expect(buildCertificateId("student-1", "web-development", "HTML & CSS", 1)).toBe(id);
  });

  it("formats certificate dates", () => {
    const formatted = formatCertificateDate(new Date("2026-07-11T00:00:00.000Z"));
    expect(formatted.toLowerCase()).toContain("july");
    expect(formatted).toContain("2026");
  });
});
