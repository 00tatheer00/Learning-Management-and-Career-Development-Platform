import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCertificateRenderPayload } from "@/lib/certificates/student-certificates";
import { renderCertificatePdf, renderCertificatePng } from "@/lib/certificates/render-certificate";
import { prisma } from "@/lib/prisma";
import { formatCertificateDate } from "@/lib/certificates/certificate-ids";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim();
  const studentId = searchParams.get("studentId")?.trim();
  const programSlug = searchParams.get("program")?.trim();
  const moduleName = searchParams.get("module")?.trim();
  const preview = searchParams.get("preview") === "1";
  const format = searchParams.get("format")?.toLowerCase();

  const user = await getCurrentUser();

  let payload: {
    studentName: string;
    moduleName: string;
    programTitle: string;
    completionDate: string;
    certificateId: string;
  } | null = null;

  // 1. Direct lookup by verification code if provided
  if (code) {
    const cert = await prisma.certificate.findFirst({
      where: {
        verificationCode: { equals: code, mode: "insensitive" },
      },
    });

    if (cert) {
      payload = {
        studentName: cert.studentNameSnapshot,
        moduleName: cert.moduleNameSnapshot,
        programTitle: cert.courseNameSnapshot,
        completionDate: formatCertificateDate(cert.completionDate),
        certificateId: cert.verificationCode,
      };
    }
  }

  // 2. Admin lookup by studentId + program + module
  if (!payload && user && (user.role === "admin" || user.role === "admin_readonly") && studentId && programSlug && moduleName) {
    const cert = await prisma.certificate.findFirst({
      where: {
        studentId,
        programSlug,
        moduleName: { equals: moduleName, mode: "insensitive" },
      },
    });

    if (cert) {
      payload = {
        studentName: cert.studentNameSnapshot,
        moduleName: cert.moduleNameSnapshot,
        programTitle: cert.courseNameSnapshot,
        completionDate: formatCertificateDate(cert.completionDate),
        certificateId: cert.verificationCode,
      };
    } else {
      // Fallback: look up student user details if certificate record pending
      const studentUser = await prisma.user.findUnique({ where: { id: studentId } });
      if (studentUser) {
        payload = {
          studentName: studentUser.name,
          moduleName,
          programTitle: programSlug === "web-development" ? "Web Development" : programSlug,
          completionDate: formatCertificateDate(new Date()),
          certificateId: `PREVIEW-${studentId.slice(0, 6)}`,
        };
      }
    }
  }

  // 3. Student lookup for logged in student user
  if (!payload && user && user.role === "student" && programSlug && moduleName) {
    payload = await getCertificateRenderPayload(user, programSlug, moduleName);
  }

  if (!payload) {
    return NextResponse.json({ error: "Certificate not found or unauthorized" }, { status: 403 });
  }

  const safeModule = (moduleName || "module").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");

  // If PNG format is explicitly requested
  if (format === "png") {
    const png = await renderCertificatePng(payload);
    const filename = `EEST-${safeModule}-certificate.png`;
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": preview
          ? `inline; filename="${filename}"`
          : `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  // Default: Ultra High-Quality PDF Certificate
  const pdf = await renderCertificatePdf(payload);
  const filename = `EEST-${safeModule}-certificate.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": preview
        ? `inline; filename="${filename}"`
        : `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
