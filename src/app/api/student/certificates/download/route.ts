import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getCertificateRenderPayload,
} from "@/lib/certificates/student-certificates";
import { renderCertificatePng } from "@/lib/certificates/render-certificate";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("program")?.trim();
  const moduleName = searchParams.get("module")?.trim();

  if (!programSlug || !moduleName) {
    return NextResponse.json({ error: "Missing program or module" }, { status: 400 });
  }

  const payload = getCertificateRenderPayload(user, programSlug, moduleName);
  if (!payload) {
    return NextResponse.json({ error: "Certificate not available" }, { status: 403 });
  }

  const png = await renderCertificatePng(payload);
  const safeModule = moduleName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const filename = `EEST-${safeModule}-certificate.png`;
  const preview = searchParams.get("preview") === "1";

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
