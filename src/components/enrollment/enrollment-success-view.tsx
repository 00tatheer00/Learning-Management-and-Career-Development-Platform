"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Printer, Sparkles, Award, FileText, QrCode, LogIn } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { getProgramBySlug } from "@/lib/data/programs";
import { getProgramRegistrationFee } from "@/lib/constants/payment";
import { OFFICIAL_PHONE_DISPLAY } from "@/lib/constants/contact";
import { SITE_CONFIG } from "@/lib/constants";
import { escapeHtml } from "@/lib/security/escape-html";

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

  const verifyPortalUrl = `${SITE_CONFIG.url}/verify`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(verifyPortalUrl, {
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
  }, [verifyPortalUrl]);

  const handlePrintSlip = () => {
    try {
      const existingFrame = document.getElementById("eest-print-receipt-iframe");
      if (existingFrame) {
        existingFrame.remove();
      }

      const iframe = document.createElement("iframe");
      iframe.id = "eest-print-receipt-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const logoUrl = `${origin}${SITE_CONFIG.logo}`;

      const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>EEST Official Fee Receipt - ${receiptNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 10px;
      margin: 0;
      line-height: 1.45;
      font-size: 12px;
    }
    .receipt-container {
      border: 2px solid #0284c7;
      border-radius: 12px;
      padding: 24px;
      position: relative;
      background: #ffffff;
      max-width: 780px;
      margin: 0 auto;
    }
    .receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e0f2fe;
      padding-bottom: 16px;
      margin-bottom: 18px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      height: 44px;
      width: auto;
      object-fit: contain;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .brand-sub {
      font-size: 10.5px;
      font-weight: 700;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 2px;
    }
    .receipt-meta {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 8px 14px;
      text-align: right;
    }
    .meta-label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0369a1;
      letter-spacing: 0.5px;
    }
    .meta-serial {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 13px;
      font-weight: 800;
      color: #ea580c;
      margin-top: 2px;
    }
    .meta-date {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    .section-heading {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .profile-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 18px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 16px;
    }
    .profile-item {
      font-size: 11px;
    }
    .item-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .item-value {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 1px;
    }
    .item-value.course {
      color: #0284c7;
      font-weight: 800;
    }
    .fee-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 18px;
    }
    .fee-table th {
      background: #f1f5f9;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      padding: 9px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .fee-table td {
      padding: 9px 12px;
      font-size: 11px;
      border-bottom: 1px solid #e2e8f0;
    }
    .fee-table tfoot td {
      background: #f0f9ff;
      border-top: 2px solid #bae6fd;
      border-bottom: none;
      padding: 10px 12px;
    }
    .footer-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 14px;
      gap: 16px;
    }
    .status-badge {
      display: inline-block;
      background: #fef3c7;
      border: 1px solid #fde68a;
      color: #b45309;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 9999px;
      margin-bottom: 4px;
    }
    .status-text {
      font-size: 10px;
      color: #64748b;
      line-height: 1.4;
      max-width: 380px;
    }
    .qr-card {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 6px 10px;
      flex-shrink: 0;
    }
    .qr-card img {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      padding: 2px;
      background: #ffffff;
      display: block;
    }
    .qr-info-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
    }
    .qr-info-sub {
      font-size: 10px;
      font-weight: 800;
      color: #0284c7;
      margin-top: 1px;
    }
    .qr-info-phone {
      font-family: ui-monospace, monospace;
      font-size: 10px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .qr-info-help {
      font-size: 8.5px;
      color: #64748b;
    }
    .bottom-disclaimer {
      margin-top: 16px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="receipt-header">
      <div class="brand-section">
        <img class="brand-logo" src="${logoUrl}" alt="EEST Logo" onerror="this.style.display='none'" />
        <div>
          <div class="brand-title">Emerging Edge School of Technology</div>
          <div class="brand-sub">Official Academic Registration &amp; Fee Payment Receipt</div>
        </div>
      </div>
      <div class="receipt-meta">
        <div class="meta-label">Receipt Reference</div>
        <div class="meta-serial">${receiptNumber}</div>
        <div class="meta-date">Date: ${currentDateStr}</div>
      </div>
    </div>

    <div class="section-heading">Student Admission &amp; Course Profile</div>
    <div class="profile-card">
      <div class="profile-item">
        <div class="item-label">Student Name</div>
        <div class="item-value">${escapeHtml(fullName)}</div>
      </div>
      <div class="profile-item">
        <div class="item-label">Enrolled Course</div>
        <div class="item-value course">${escapeHtml(programTitle)}</div>
      </div>
      <div class="profile-item">
        <div class="item-label">Starting Module</div>
        <div class="item-value">${escapeHtml(levelName || "Module 1")}</div>
      </div>
      <div class="profile-item">
        <div class="item-label">Academic Batch</div>
        <div class="item-value">Batch 1</div>
      </div>
      <div class="profile-item">
        <div class="item-label">Student Email</div>
        <div class="item-value" style="font-family: ui-monospace, monospace;">${escapeHtml(email)}</div>
      </div>
      <div class="profile-item">
        <div class="item-label">Contact / WhatsApp</div>
        <div class="item-value" style="font-family: ui-monospace, monospace;">${escapeHtml(whatsapp)}</div>
      </div>
    </div>

    <div class="section-heading">Financial Breakdown &amp; Fee Details</div>
    <table class="fee-table">
      <thead>
        <tr>
          <th>Fee Category</th>
          <th>Payment Method</th>
          <th style="text-align: right;">Amount (PKR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 600;">Course Tuition Fee (100% Free Scholarship)</td>
          <td style="color: #059669; font-weight: 700;">SPONSORED BY EEST</td>
          <td style="text-align: right; color: #059669; font-weight: 700; font-family: ui-monospace, monospace;">PKR 0</td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Module Registration Fee (${escapeHtml(levelName || "Module 1")})</td>
          <td style="font-weight: 600;">Easypaisa Online Transfer</td>
          <td style="text-align: right; font-weight: 700; font-family: ui-monospace, monospace;">PKR ${feeAmount.toLocaleString()}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="font-size: 11px; font-weight: 800; text-transform: uppercase;">Total Fee Paid</td>
          <td style="text-align: right; font-size: 14px; font-weight: 900; color: #ea580c; font-family: ui-monospace, monospace;">PKR ${feeAmount.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>

    <div class="footer-section">
      <div>
        <div class="status-badge">● Pending Payment Verification</div>
        <div class="status-text">
          Official seal of Emerging Edge School of Technology. Receipt valid upon verification of Easypaisa TRX ID.
        </div>
      </div>
      <div class="qr-card">
        ${qrDataUrl ? `<img src="${qrDataUrl}" alt="Verify QR" />` : ""}
        <div>
          <div class="qr-info-title">Official QR Verification</div>
          <div class="qr-info-sub">EEST Student Portal</div>
          <div class="qr-info-phone">${OFFICIAL_PHONE_DISPLAY}</div>
          <div class="qr-info-help">Scan to check portal status</div>
        </div>
      </div>
    </div>

    <div class="bottom-disclaimer">
      <span>Office of the Registrar • Emerging Edge School of Technology</span>
      <span>Electronically Verified Academic Document</span>
    </div>
  </div>
</body>
</html>`;

      const frameDoc = iframe.contentWindow?.document;
      if (!frameDoc) {
        window.print();
        return;
      }

      frameDoc.open();
      frameDoc.write(receiptHtml);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        } finally {
          setTimeout(() => {
            iframe.remove();
          }, 1500);
        }
      }, 350);
    } catch {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
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
      <div id="printable-receipt" className="printable-receipt-container rounded-2xl border-2 border-sky-500/40 bg-card p-6 sm:p-8 shadow-lg text-left space-y-6 relative overflow-hidden bg-gradient-to-b from-sky-50/30 via-background to-background dark:from-slate-900/40">
        {/* Background Watermark Stamp Effect */}
        <div className="absolute -right-12 -bottom-12 opacity-5 dark:opacity-10 pointer-events-none select-none">
          <Award size={280} className="text-sky-600" />
        </div>

        {/* Header Branding & Receipt Serial */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-sky-500/20 pb-5">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE_CONFIG.logo}
              alt="Emerging Edge School of Technology"
              className="h-10 sm:h-12 w-auto object-contain shrink-0"
            />
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
                Emerging Edge School of Technology
              </h3>
              <p className="text-[10.5px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                Official Academic Registration &amp; Fee Payment Receipt
              </p>
            </div>
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
            <p className="font-bold text-foreground text-xs mt-0.5">Batch 1</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Student Email:</span>
            <p className="font-semibold text-foreground text-xs mt-0.5 font-mono">{email}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Contact / Mobile Number:</span>
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

          {/* Direct Verification QR Code Card */}
          <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-sky-500/30 shrink-0 shadow-sm">
            <div className="h-20 w-20 bg-white rounded-lg border border-border p-1 flex items-center justify-center shrink-0">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Scan QR to Verify on Portal"
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
                Official QR Verification
              </p>
              <p className="text-sky-600 dark:text-sky-400 font-extrabold text-xs">
                EEST Student Portal
              </p>
              <p className="font-mono text-xs font-black text-foreground mt-1">
                {OFFICIAL_PHONE_DISPLAY}
              </p>
              <p className="text-[9.5px] text-muted font-medium">Scan to check portal status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: PDF Download & Portal Login */}
      <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
        <Button onClick={handlePrintSlip} variant="outline" size="sm" className="gap-2 font-bold text-xs border-primary/30 hover:bg-primary/5">
          <Printer size={15} /> Download Official PDF Receipt
        </Button>

        <Button asChild size="sm" className="gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-white shadow-sm">
          <Link href="/login">
            <LogIn size={15} /> Go to Student Portal Login
          </Link>
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
              <p className="font-bold text-foreground">Portal Login Credentials Received via Email</p>
              <p className="text-muted mt-0.5">You will receive an automated Email with your Student Portal login password.</p>
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
