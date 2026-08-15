"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SealCheck,
  CheckCircle,
  CalendarCheck,
  GraduationCap,
  Sparkle,
  ArrowLeft,
  DownloadSimple,
  Copy,
  Check,
  ShieldCheck,
  ArrowSquareOut,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/ui/toast";

interface CertificateVerificationViewProps {
  cert: {
    verificationCode: string;
    studentName: string;
    courseTitle: string;
    moduleName: string;
    completionDateLabel: string;
    issuedAtLabel: string;
    certificateId: string;
    status: string;
  };
}

export function CertificateVerificationView({ cert }: CertificateVerificationViewProps) {
  const [copied, setCopied] = useState(false);

  const pdfDownloadUrl = `/api/student/certificates/download?code=${encodeURIComponent(cert.verificationCode)}&format=pdf`;
  const pngDownloadUrl = `/api/student/certificates/download?code=${encodeURIComponent(cert.verificationCode)}&format=png`;
  const previewImageUrl = `/api/student/certificates/download?code=${encodeURIComponent(cert.verificationCode)}&format=png&preview=1`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Verification link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Verify Another Credential
        </Link>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Verified & Valid Credential
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Official Metadata & Download Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header Identity */}
            <div className="space-y-2 border-b border-border pb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Official Recipient
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {cert.studentName}
              </h1>
              <p className="text-xs text-muted-foreground">
                Successfully completed the accredited curriculum requirement.
              </p>
            </div>

            {/* Credential Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-primary" />
                  Program
                </span>
                <p className="text-sm font-bold text-foreground">{cert.courseTitle}</p>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkle size={15} weight="fill" />
                  Module Completed
                </span>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {cert.moduleName}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CalendarCheck size={15} className="text-emerald-500" />
                  Completion Date
                </span>
                <p className="text-sm font-bold text-foreground">{cert.completionDateLabel}</p>
              </div>

              <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle size={15} weight="fill" />
                  Official / Issued
                </p>
              </div>
            </div>

            {/* Verification Code Box */}
            <div className="rounded-2xl border border-border bg-muted/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Credential ID
                </span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {cert.verificationCode}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="rounded-xl text-xs gap-1.5 shrink-0"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? "Link Copied" : "Copy Link"}
              </Button>
            </div>

            {/* Issuing Authority */}
            <div className="text-xs text-muted-foreground pt-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary shrink-0" />
              <span>
                Issued by <strong className="text-foreground">Emerging Edge School of Technology</strong>
              </span>
            </div>

            {/* Download Buttons */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="flex-1 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 shadow-sm">
                <a href={pdfDownloadUrl} target="_blank" rel="noopener noreferrer">
                  <DownloadSimple size={18} weight="bold" />
                  Download PDF
                </a>
              </Button>

              <Button asChild variant="outline" size="lg" className="flex-1 rounded-2xl gap-2 font-semibold">
                <a href={pngDownloadUrl} target="_blank" rel="noopener noreferrer">
                  <ImageIcon size={18} />
                  Download PNG
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Live High-Resolution Certificate Frame */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <SealCheck size={16} weight="fill" className="text-amber-500" />
                Live Certificate Preview
              </span>

              <a
                href={previewImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                View Fullscreen
                <ArrowSquareOut size={13} />
              </a>
            </div>

            {/* Visual Certificate Frame */}
            <div className="relative aspect-[1024/682] w-full overflow-hidden rounded-2xl border-2 border-border/80 bg-muted shadow-md group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt={`Certificate of Completion - ${cert.studentName}`}
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                loading="eager"
              />
            </div>

            <p className="text-[11px] text-center text-muted-foreground pt-1">
              Verified digital credential issued under the seal of Emerging Edge School of Technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
