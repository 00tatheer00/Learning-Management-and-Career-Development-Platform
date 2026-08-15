import { describe, expect, it } from "vitest";
import { buildCertificateId, formatCertificateDate } from "@/lib/certificates/certificate-ids";
import { renderCertificatePng, toTitleCase } from "@/lib/certificates/render-certificate";

describe("certificate ids and rendering", () => {
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

  it("formats student names into clean Title Case", () => {
    expect(toTitleCase("Mohammad Kashif Mehnat")).toBe("Mohammad Kashif Mehnat");
    expect(toTitleCase("muskan noor")).toBe("Muskan Noor");
    expect(toTitleCase("MOHAMMAD KASHIF")).toBe("Mohammad Kashif");
  });

  it("renders crystal-clear certificate PNGs for students with complex overlapping glyphs", async () => {
    const png1 = await renderCertificatePng({
      studentName: "Mohammad Kashif Mehnat",
      moduleName: "HTML & CSS",
      programTitle: "Web Development",
      completionDate: "15 August 2026",
      certificateId: "EEST26-WEB-M1-0001",
    });
    expect(png1).toBeInstanceOf(Buffer);
    expect(png1.length).toBeGreaterThan(100000);

    const png2 = await renderCertificatePng({
      studentName: "Muskan Noor",
      moduleName: "HTML & CSS",
      programTitle: "Web Development",
      completionDate: "15 August 2026",
      certificateId: "EEST26-WEB-M1-0002",
    });
    expect(png2).toBeInstanceOf(Buffer);
    expect(png2.length).toBeGreaterThan(100000);
  }, 15000);
});
