"use client";

import { useState } from "react";
import { Wallet, Copy, Check, ArrowRight } from "@phosphor-icons/react";
import { PAYMENT_CONFIG } from "@/lib/constants/payment";
import { cn } from "@/lib/utils";

interface PaymentInfoCardProps {
  className?: string;
  compact?: boolean;
}

export function PaymentInfoCard({ className, compact = false }: PaymentInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    await navigator.clipboard.writeText(PAYMENT_CONFIG.easypaisa.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/25 to-white shadow-sm",
        compact ? "p-3.5" : "p-4",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-600/20">
            <Wallet size={18} weight="duotone" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-foreground">
              Easypaisa Payment
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Rs {PAYMENT_CONFIG.registrationFee.toLocaleString()} · one-time registration
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Send here
        </span>
      </div>

      <div className="relative flex items-center gap-2 rounded-lg border border-emerald-200/90 bg-white/90 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700/80">
            Account number
          </p>
          <p className="truncate font-bold tabular-nums tracking-wide text-emerald-700 text-lg sm:text-xl">
            {PAYMENT_CONFIG.easypaisa.number}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {PAYMENT_CONFIG.easypaisa.accountName}
          </p>
        </div>
        <button
          type="button"
          onClick={copyNumber}
          title={copied ? "Copied" : "Copy Easypaisa number"}
          aria-label={copied ? "Copied" : "Copy Easypaisa number"}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
            copied
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-border bg-surface text-muted hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          )}
        >
          {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
        </button>
      </div>

      {!compact && (
        <p className="relative mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted">
          <ArrowRight size={14} weight="bold" className="mt-0.5 shrink-0 text-emerald-600" />
          Easypaisa app → Send Money → screenshot → upload in the form.
        </p>
      )}
    </div>
  );
}
