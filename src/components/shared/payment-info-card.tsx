"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        "overflow-hidden rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/80 shadow-lg shadow-emerald-500/15",
        className
      )}
    >
      <div className="bg-emerald-600 px-4 py-3 sm:px-5">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-50">
          Easypaisa Payment
        </p>
        <p className="text-xs text-emerald-100 mt-0.5">
          Send Rs {PAYMENT_CONFIG.registrationFee.toLocaleString()} to this account
        </p>
      </div>

      <div className={cn("p-4 sm:p-5", compact && "p-4")}>
        {!compact && (
          <p className="text-sm text-emerald-900/80 mb-4 leading-relaxed">
            Open Easypaisa app → Send Money → enter the number below → take screenshot →
            upload in the form.
          </p>
        )}

        <div className="rounded-xl border-2 border-emerald-400 bg-white p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            Easypaisa Account Number
          </p>
          <p className="font-black text-3xl sm:text-4xl text-emerald-600 tracking-wide tabular-nums">
            {PAYMENT_CONFIG.easypaisa.number}
          </p>
          <p className="mt-2 text-sm font-semibold text-emerald-800">
            {PAYMENT_CONFIG.easypaisa.accountName}
          </p>
          <Button
            type="button"
            size="sm"
            onClick={copyNumber}
            className="mt-4 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Easypaisa Number
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
