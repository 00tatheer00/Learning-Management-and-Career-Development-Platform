"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Certificate,
  DownloadSimple,
  LockSimple,
  Eye,
  SealCheck,
  Copy,
  CheckCircle,
  Sparkle,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { PortalSurfaceCard } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import type { StudentCertificateModuleView } from "@/lib/certificates/student-certificates";

interface StudentCertificatesPanelProps {
  modules: StudentCertificateModuleView[];
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = code;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 transition-colors text-[11px] font-mono font-bold border border-amber-500/20"
      title="Copy verification code"
    >
      {copied ? <CheckCircle size={12} weight="fill" className="text-emerald-500" /> : <Copy size={12} />}
      {code}
    </button>
  );
}

export function StudentCertificatesPanel({ modules }: StudentCertificatesPanelProps) {
  const issued = modules.filter((row) => row.status === "issued");
  const locked = modules.filter((row) => row.status === "locked");

  return (
    <div className="space-y-10">
      {issued.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-600">
              Your Earned Certificates
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {issued.map((row) => {
              const previewUrl = row.downloadPath
                ? `${row.downloadPath}${row.downloadPath.includes("?") ? "&" : "?"}format=png&preview=1`
                : null;

              return (
                <PortalSurfaceCard
                  key={`${row.programSlug}-${row.moduleName}`}
                  className="group relative overflow-hidden p-0 border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300"
                >
                  {/* Certificate Preview Thumbnail */}
                  {previewUrl && (
                    <div className="relative w-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b border-amber-200/30 dark:border-amber-800/20 overflow-hidden">
                      <div className="flex items-center justify-center p-4 sm:p-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt={`Certificate for ${row.moduleName}`}
                          className="w-full max-w-md rounded-lg shadow-lg border border-amber-200/50 dark:border-amber-700/30 group-hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>

                      {/* Sparkle badge */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-sm">
                          <SealCheck size={12} weight="fill" />
                          Verified
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Certificate Info */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Certificate size={24} weight="duotone" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {row.programTitle}
                        </p>
                        <h2 className="text-lg font-bold text-pt tracking-tight">{row.moduleName}</h2>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-pt-muted">
                      {row.issuedAtLabel && (
                        <span className="flex items-center gap-1">
                          <Sparkle size={12} weight="fill" className="text-amber-500" />
                          Issued {row.issuedAtLabel}
                        </span>
                      )}
                      {row.certificateId && (
                        <CopyCodeButton code={row.certificateId} />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {row.downloadPath && (
                        <Button size="sm" className="rounded-xl gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm" asChild>
                          <a href={row.downloadPath} download>
                            <DownloadSimple size={15} weight="bold" />
                            Download PDF
                          </a>
                        </Button>
                      )}
                      {previewUrl && (
                        <Button size="sm" variant="outline" className="rounded-xl gap-1.5" asChild>
                          <Link
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye size={15} />
                            Preview
                          </Link>
                        </Button>
                      )}
                      {row.verifyPath && (
                        <Button size="sm" variant="secondary" className="rounded-xl gap-1.5" asChild>
                          <Link href={row.verifyPath} target="_blank">
                            <ArrowSquareOut size={14} />
                            Verify
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </PortalSurfaceCard>
              );
            })}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-pt-faint">
            Locked — complete module to unlock
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {locked.map((row) => (
              <div
                key={`${row.programSlug}-${row.moduleName}`}
                className="rounded-2xl border border-dashed border-pt bg-surface/40 p-4 opacity-90"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
                    <LockSimple size={20} weight="duotone" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-pt-muted">{row.programTitle}</p>
                    <p className="font-semibold text-pt">{row.moduleName}</p>
                    <p className="mt-1 text-xs text-pt-muted">
                      Finish this module to earn your certificate.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {issued.length === 0 && locked.length === 0 && (
        <div className="rounded-2xl border border-dashed border-pt p-8 text-center bg-surface/40">
          <Certificate size={40} weight="duotone" className="mx-auto text-amber-500 mb-3" />
          <h3 className="text-base font-bold text-pt">No Certificates Issued Yet</h3>
          <p className="text-sm text-pt-muted mt-1 max-w-md mx-auto">
            Module 1 certificates are issued upon completion and verification by your course instructor. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
