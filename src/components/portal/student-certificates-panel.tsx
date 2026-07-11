"use client";

import Link from "next/link";
import { Certificate, DownloadSimple, LockSimple } from "@phosphor-icons/react";
import { PortalSurfaceCard } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import type { StudentCertificateModuleView } from "@/lib/certificates/student-certificates";

interface StudentCertificatesPanelProps {
  modules: StudentCertificateModuleView[];
}

export function StudentCertificatesPanel({ modules }: StudentCertificatesPanelProps) {
  const issued = modules.filter((row) => row.status === "issued");
  const locked = modules.filter((row) => row.status === "locked");

  return (
    <div className="space-y-8">
      {issued.length > 0 && (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary mb-3">
            Your certificates
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {issued.map((row) => (
              <PortalSurfaceCard key={`${row.programSlug}-${row.moduleName}`} className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Certificate size={26} weight="duotone" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">
                      {row.programTitle}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-pt">{row.moduleName}</h2>
                    <p className="mt-2 text-sm text-pt-muted">
                      Issued {row.issuedAtLabel}
                      {row.certificateId ? ` · ${row.certificateId}` : ""}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {row.downloadPath && (
                        <Button size="sm" asChild>
                          <a href={row.downloadPath} download>
                            <DownloadSimple size={16} weight="bold" />
                            Download PNG
                          </a>
                        </Button>
                      )}
                      {row.downloadPath && (
                        <Button size="sm" variant="outline" asChild>
                          <Link
                            href={`${row.downloadPath}&preview=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View certificate
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </PortalSurfaceCard>
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-pt-faint mb-3">
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
    </div>
  );
}
