"use client";

import { CheckCircle2, Download, MessageSquare, ShieldCheck, ArrowRight, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnrollmentSuccessViewProps {
  applicationNumber: number;
  fullName: string;
  programSlug: string;
  levelName: string;
  email: string;
  whatsapp: string;
}

export function EnrollmentSuccessView({
  applicationNumber,
  fullName,
  programSlug,
  levelName,
  email,
  whatsapp,
}: EnrollmentSuccessViewProps) {
  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-center max-w-2xl mx-auto py-4">
      {/* Top Success Badge & Icon */}
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <CheckCircle2 size={44} />
        </div>
      </div>

      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-black mb-3">
          <Sparkles size={14} /> Application Submitted Successfully
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Welcome to EEST, {fullName}! 🎉
        </h2>

        <p className="mt-2 text-sm text-muted font-medium leading-relaxed max-w-lg mx-auto">
          Your enrollment application <strong className="text-primary font-black">#{applicationNumber}</strong> has been received and logged in our system.
        </p>
      </div>

      {/* Printable Slip Preview Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-card p-6 shadow-sm text-left space-y-4 print:border-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Official Registration Slip</p>
            <h3 className="text-base font-extrabold text-foreground">Emerging Edge School of Technology</h3>
          </div>
          <span className="text-sm font-black text-primary">App #{applicationNumber}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted font-medium">Applicant Name:</span>
            <p className="font-bold text-foreground text-sm">{fullName}</p>
          </div>

          <div>
            <span className="text-muted font-medium">Program / Module:</span>
            <p className="font-bold text-foreground text-sm capitalize">{programSlug.replace("-", " ")} ({levelName})</p>
          </div>

          <div>
            <span className="text-muted font-medium">Email Address:</span>
            <p className="font-semibold text-foreground">{email}</p>
          </div>

          <div>
            <span className="text-muted font-medium">WhatsApp:</span>
            <p className="font-semibold text-foreground">{whatsapp}</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-border/80 text-[11px] text-muted">
          <span>Status: <strong className="text-amber-600 dark:text-amber-400 font-bold">Pending Payment Verification</strong></span>
          <span>Submitted on: {new Date().toLocaleDateString("en-GB")}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
        <Button onClick={handlePrintSlip} variant="outline" size="sm" className="gap-2 font-bold text-xs">
          <Printer size={14} /> Print / Save Slip PDF
        </Button>

        <Button asChild size="sm" className="gap-2 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
          <a
            href="https://chat.whatsapp.com/EN0h0aFkQ6YJ6FwE93M01W"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare size={14} /> Join Official Batch WhatsApp Group
          </a>
        </Button>
      </div>

      {/* What Happens Next Timeline */}
      <div className="rounded-2xl border border-border bg-surface/50 p-5 text-left space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-500" />
          What Happens Next? (3 Simple Steps)
        </h4>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">1</span>
            <div>
              <p className="font-bold text-foreground">Payment Screenshot Verification (within 24 hours)</p>
              <p className="text-muted mt-0.5">Our admin team verifies your uploaded Easypaisa receipt TRX ID against banking logs.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">2</span>
            <div>
              <p className="font-bold text-foreground">Portal Login Credentials Received</p>
              <p className="text-muted mt-0.5">You will receive an automated Email &amp; WhatsApp notification with your Student Portal password.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">3</span>
            <div>
              <p className="font-bold text-foreground">Start Live Online Classes</p>
              <p className="text-muted mt-0.5">Log in to your Student Portal to join live interactive lectures, access materials, and submit assignments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
