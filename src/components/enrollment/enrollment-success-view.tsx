"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MessageSquare, ShieldCheck, Printer, Sparkles, Award, FileText, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { getProgramBySlug } from "@/lib/data/programs";
import { getProgramRegistrationFee } from "@/lib/constants/payment";
import { getOfficialWhatsAppUrl, BUSINESS_WHATSAPP_DISPLAY } from "@/lib/constants/contact";

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
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const program = getProgramBySlug(programSlug);
  const programTitle = program?.title ?? programSlug.replace("-", " ");
  const feeAmount = getProgramRegistrationFee(programSlug);
  const receiptNumber = `EEST-2026-REG-${String(applicationNumber).padStart(4, "0")}`;
  const currentDateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const waMessage = `Assalam-o-Alaikum! My name is ${fullName}. App #${receiptNumber} for ${programTitle} (${levelName}). Please verify my payment receipt & activate my portal password.`;
  const officialWaUrl = getOfficialWhatsAppUrl(waMessage);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(officialWaUrl, {
      margin: 1,
      width: 220,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code generation error:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [officialWaUrl]);

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Print CSS Isolation: Force EXACTLY 1 PAGE PDF export without collapsing parents */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          header, footer, nav, .print\\:hidden {
            display: none !important;
          }
          html, body, #__next, main, section, #register-form-panel {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .printable-receipt-container {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 20px !important;
            border: 2px solid #0284c7 !important;
            border-radius: 12px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-before: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Screen Success Banner */}
      <div className="text-center space-y-3 print:hidden">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 size={38} />
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-black mb-2">
            <Sparkles size={14} /> Application Submitted Successfully
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome to EEST, {fullName}! 🎉
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-muted font-medium leading-relaxed max-w-lg mx-auto">
            Your application <strong className="text-primary font-black">#{receiptNumber}</strong> is logged. Your official fee receipt is generated below.
          </p>
        </div>
      </div>

      {/* OFFICIAL ACADEMIC & FINANCIAL FEE RECEIPT SLIP */}
      <div className="printable-receipt-container rounded-2xl border-2 border-sky-500/40 bg-card p-6 sm:p-8 shadow-lg text-left space-y-6 relative overflow-hidden bg-gradient-to-b from-sky-50/30 via-background to-background dark:from-slate-900/40">
        {/* Background Watermark Stamp Effect */}
        <div className="absolute -right-12 -bottom-12 opacity-5 dark:opacity-10 pointer-events-none select-none">
          <Award size={280} className="text-sky-600" />
        </div>

        {/* Header Branding & Receipt Serial */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-sky-500/20 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                E
              </div>
              <h3 className="text-lg font-black tracking-tight text-foreground uppercase">
                Emerging Edge School of Technology
              </h3>
            </div>
            <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest pl-9">
              Official Academic Registration &amp; Fee Payment Receipt
            </p>
          </div>

          <div className="text-left sm:text-right bg-sky-500/10 border border-sky-500/30 rounded-xl px-3.5 py-2 shrink-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">Receipt Reference</p>
            <p className="text-sm font-black font-mono text-primary">{receiptNumber}</p>
            <p className="text-[10px] text-muted font-medium mt-0.5">Date: {currentDateStr}</p>
          </div>
        </div>

        {/* Student & Program Profile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-surface/80 rounded-xl p-4 border border-border/80">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Student Name:</span>
            <p className="font-extrabold text-foreground text-sm mt-0.5">{fullName}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Enrolled Course:</span>
            <p className="font-extrabold text-sky-600 dark:text-sky-400 text-sm mt-0.5">{programTitle}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Starting Module:</span>
            <p className="font-bold text-foreground text-xs mt-0.5">{levelName || "Module 1"}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Academic Batch:</span>
            <p className="font-bold text-foreground text-xs mt-0.5">Batch 1 (Phase 2 - 2nd Module)</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Student Email:</span>
            <p className="font-semibold text-foreground text-xs mt-0.5 font-mono">{email}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">WhatsApp Number:</span>
            <p className="font-semibold text-foreground text-xs mt-0.5 font-mono">{whatsapp}</p>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <FileText size={14} className="text-sky-500" />
            Financial Breakdown &amp; Fee Details
          </p>

          <div className="overflow-hidden rounded-xl border border-border text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface border-b border-border text-[11px] font-bold uppercase text-muted">
                <tr>
                  <th className="py-2.5 px-3.5">Fee Category</th>
                  <th className="py-2.5 px-3.5">Payment Method</th>
                  <th className="py-2.5 px-3.5 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium text-foreground">
                <tr>
                  <td className="py-2.5 px-3.5 font-semibold">Course Tuition Fee (100% Free Scholarship)</td>
                  <td className="py-2.5 px-3.5 text-emerald-600 font-bold">SPONSORED BY EEST</td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-emerald-600 font-bold">PKR 0</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3.5 font-semibold">Module Registration Fee ({levelName || "Module 1"})</td>
                  <td className="py-2.5 px-3.5 font-semibold">Easypaisa Online Transfer</td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-foreground">PKR {feeAmount.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot className="bg-sky-500/10 border-t-2 border-sky-500/30 font-bold">
                <tr>
                  <td colSpan={2} className="py-3 px-3.5 text-xs font-black uppercase text-foreground">Total Fee Paid</td>
                  <td className="py-3 px-3.5 text-right font-mono text-base font-black text-primary">PKR {feeAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Verification Status Footer & Direct QR Code Card */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/80 text-xs">
          {/* Status & Registrar Seal */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold text-[11px]">
                ● Pending Payment Verification
              </span>
            </div>
            <p className="text-[11px] text-muted leading-snug max-w-sm">
              Official seal of Emerging Edge School of Technology. Receipt valid upon verification of Easypaisa TRX ID.
            </p>
          </div>

          {/* Direct WhatsApp Verification QR Code Card with Phone Number */}
          <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-sky-500/30 shrink-0 shadow-sm">
            <div className="h-20 w-20 bg-white rounded-lg border border-border p-1 flex items-center justify-center shrink-0">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan QR to Chat on WhatsApp"
                  width={72}
                  height={72}
                  className="rounded object-contain"
                />
              ) : (
                <div className="text-center text-muted p-1">
                  <QrCode size={36} className="mx-auto text-sky-600 animate-pulse" />
                </div>
              )}
            </div>
            <div className="text-left space-y-0.5">
              <p className="font-black text-foreground uppercase tracking-wider text-[11px]">
                Scan QR to Verify
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-1">
                💬 WhatsApp Support
              </p>
              <p className="font-mono text-xs font-black text-sky-700 dark:text-sky-300 mt-1">
                {BUSINESS_WHATSAPP_DISPLAY}
              </p>
              <p className="text-[9.5px] text-muted font-medium">Scan code or message helpline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action: Student Initiated Chat (Prevents WhatsApp Account Restrictions) */}
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 text-center space-y-2.5 print:hidden">
        <p className="text-xs font-black text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-1.5">
          <Sparkles size={16} className="text-emerald-600" />
          Speed Up Your Payment Verification &amp; Password Activation:
        </p>
        <p className="text-[11.5px] text-emerald-900/80 dark:text-emerald-300 font-medium max-w-md mx-auto">
          Send a quick message to our Admissions Support on WhatsApp ({BUSINESS_WHATSAPP_DISPLAY}) so your payment is verified immediately.
        </p>
        <a
          href={officialWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700 transition-all"
        >
          <MessageSquare size={16} /> Send WhatsApp Message to Admissions (Instant Verification)
        </a>
      </div>

      {/* Action Buttons: PDF Download & Group Join */}
      <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
        <Button onClick={handlePrintSlip} variant="outline" size="sm" className="gap-2 font-bold text-xs border-primary/30 hover:bg-primary/5">
          <Printer size={15} /> Download Official PDF Receipt
        </Button>

        <Button asChild size="sm" className="gap-2 font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm">
          <a
            href="https://chat.whatsapp.com/EN0h0aFkQ6YJ6FwE93M01W"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare size={15} /> Join Official Batch WhatsApp Group
          </a>
        </Button>
      </div>

      {/* What Happens Next Timeline */}
      <div className="rounded-2xl border border-border bg-surface/50 p-5 text-left space-y-3 print:hidden">
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
