import type { Metadata } from "next";
import { verifyCertificateByCode } from "@/lib/certificates/certificate-service";
import Link from "next/link";
import { WarningCircle, ArrowLeft, MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { CertificateVerificationView } from "@/components/certificates/certificate-verification-view";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo/metadata";

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { code } = await params;
  const sanitizedCode = decodeURIComponent(code || "").trim();
  const cert =
    sanitizedCode.length >= 3 && sanitizedCode.length <= 64
      ? await verifyCertificateByCode(sanitizedCode)
      : null;

  if (cert) {
    return createMetadata({
      title: `Verified Certificate: ${cert.studentName} — ${cert.programTitle} | EEST Registry`,
      description: `Official verification for ${cert.studentName}'s completion of ${cert.programTitle} (${cert.level}) with Credential ID ${cert.code}.`,
      path: `/verify/${encodeURIComponent(sanitizedCode)}`,
      keywords: [
        `Certificate ${cert.code}`,
        `${cert.studentName} Certificate`,
        `${cert.programTitle} Credential`,
        "Verified Student Certificate",
        "EEST Credential Registry",
      ],
    });
  }

  return createMetadata({
    title: `Verify Credential: ${sanitizedCode || "Certificate"} | EEST Registry`,
    description: "Official certificate verification portal for Emerging Edge School of Technology.",
    path: `/verify/${encodeURIComponent(sanitizedCode)}`,
    noIndex: true,
  });
}

export default async function PublicVerifyCodePage({ params }: VerifyPageProps) {
  const { code } = await params;
  const sanitizedCode = decodeURIComponent(code || "").trim();
  const cert =
    sanitizedCode.length >= 3 && sanitizedCode.length <= 64
      ? await verifyCertificateByCode(sanitizedCode)
      : null;

  return (
    <div className="py-10 sm:py-16 lg:py-20">
      <div className="container-custom max-w-6xl px-4 sm:px-6">
        {cert ? (
          <CertificateVerificationView cert={cert} />
        ) : (
          /* NOT FOUND STATE */
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="rounded-3xl border border-destructive/20 bg-card p-8 sm:p-10 shadow-lg space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
                <WarningCircle size={36} weight="fill" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Credential Not Found
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No record was found for credential ID:{" "}
                  <span className="font-mono font-bold text-destructive break-all">{code}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground text-left space-y-2">
                <p className="font-bold text-foreground">Possible reasons:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>The code was mistyped (e.g. check dashes, letters, and numbers).</li>
                  <li>The certificate has not yet been issued by the administration.</li>
                  <li>The certificate has been revoked or updated.</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="flex-1 rounded-2xl gap-2 font-bold">
                  <Link href="/verify">
                    <MagnifyingGlass size={18} />
                    Try Another Code
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="flex-1 rounded-2xl gap-2">
                  <Link href="/contact">
                    <ShieldCheck size={18} />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Return to Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
