"use client";

import { Certificate } from "@phosphor-icons/react";
import { MODULE_CERTIFICATE_DETAIL, MODULE_CERTIFICATE_TAGLINE } from "@/lib/constants/program-marketing";

export function ModuleCertificateCallout() {
  return (
    <div className="mb-14 flex gap-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-5 sm:p-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <Certificate size={24} weight="duotone" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-800">
          Module Certificates
        </p>
        <p className="mt-2 font-semibold text-foreground">{MODULE_CERTIFICATE_TAGLINE}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{MODULE_CERTIFICATE_DETAIL}</p>
      </div>
    </div>
  );
}
