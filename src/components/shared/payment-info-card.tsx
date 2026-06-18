"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAYMENT_CONFIG } from "@/lib/constants/payment";
import { cn } from "@/lib/utils";

interface PaymentInfoCardProps {
  className?: string;
}

export function PaymentInfoCard({ className }: PaymentInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    await navigator.clipboard.writeText(PAYMENT_CONFIG.easypaisa.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/25 bg-white p-5 lg:p-6 shadow-sm",
        className
      )}
    >
        <p className="text-sm font-semibold text-foreground mb-1">
          How to pay Rs {PAYMENT_CONFIG.registrationFee.toLocaleString()}
        </p>
        <p className="text-sm text-muted mb-4">
          Open Easypaisa app → Send money → Take screenshot → Upload in the form below.
        </p>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
            Easypaisa Account
          </p>
          <p className="font-bold text-xl text-primary">
            {PAYMENT_CONFIG.easypaisa.number}
          </p>
          <p className="text-sm text-muted">{PAYMENT_CONFIG.easypaisa.accountName}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={copyNumber}>
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Number
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
