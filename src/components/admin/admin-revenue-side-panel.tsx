"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  CurrencyCircleDollar,
  X,
  ArrowClockwise,
  Buildings,
  GraduationCap,
  Sparkle,
  Wallet,
  Copy,
  Check,
  CheckCircle,
  ArrowCounterClockwise,
  EnvelopeSimple,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import type {
  AdminRevenueStats,
  AdminRevenuePhaseStats,
  AdminRevenueCourseStats,
} from "@/lib/api/admin-revenue";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProgramsForPhase } from "@/lib/constants/batch";
import { toast } from "@/lib/ui/toast";
import { uploadDirectToCloudinary } from "@/lib/cloudinary-client";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface TrainerPayoutRecord {
  id: string;
  programSlug: string;
  phase: string;
  period: string;
  amount: number;
  studentCount: number;
  trainerName?: string | null;
  trainerEmail?: string | null;
  paidAt: string;
  paidBy: string;
  paymentAccount?: string | null;
  recipientAccount?: string | null;
  transactionRef?: string | null;
  receiptUrl?: string | null;
  receiptPublicId?: string | null;
  note?: string | null;
  emailSent?: boolean;
  emailSentAt?: string | null;
}

type RevenuePeriod = "all" | "week" | "month" | string;

interface AdminRevenueContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  stats: AdminRevenueStats | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AdminRevenueContext = createContext<AdminRevenueContextValue | null>(null);

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-PK")}`;
}

function getPeriodStats(
  stats: AdminRevenuePhaseStats,
  period: RevenuePeriod,
  selectedPhase: "all" | "phase-1" | "phase-2" | "phase-3"
) {
  if (period === "week") {
    return {
      students: stats.thisWeekApproved,
      gross: stats.thisWeekGross,
      management: stats.thisWeekManagement,
      trainer: stats.thisWeekTrainer,
      school: stats.thisWeekSchool,
      label: "This week",
    };
  }
  if (period === "month") {
    return {
      students: stats.thisMonthApproved,
      gross: stats.thisMonthGross,
      management: stats.thisMonthManagement,
      trainer: stats.thisMonthTrainer,
      school: stats.thisMonthSchool,
      label: `This month (${new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date())})`,
    };
  }
  if (stats.monthlyBreakdown && stats.monthlyBreakdown.length > 0) {
    const found = stats.monthlyBreakdown.find((m) => m.monthKey === period);
    if (found) {
      return {
        students: found.approvedCount,
        gross: found.gross,
        management: found.management,
        trainer: found.trainer,
        school: found.school,
        label: found.label,
      };
    }
  }
  return {
    students: stats.totalApproved,
    gross: stats.totalGross,
    management: stats.totalManagement,
    trainer: stats.totalTrainer,
    school: stats.totalSchool,
    label:
      selectedPhase === "phase-1"
        ? "Phase 1 (Web & App 1st Module)"
        : selectedPhase === "phase-2"
          ? "Phase 2 (Web & App 2nd, AI 1st Module)"
          : selectedPhase === "phase-3"
            ? "Phase 3 (All Courses)"
            : "All Time (All Phases)",
  };
}

function getCoursePhaseModuleSubtitle(programSlug: string, selectedPhase: string): string | null {
  if (selectedPhase === "phase-3") {
    if (programSlug === "web-development") return "Module 3 · React.js & Modern Frontend";
    if (programSlug === "app-development") return "Module 3 · Flutter, Firebase & Cloud APIs";
    if (programSlug === "artificial-intelligence") return "Module 2 · Python Data Science to ML";
    if (programSlug === "digital-marketing") return "Phase 3 · Social Media, Ads & AI Marketing";
    if (programSlug === "ecommerce") return "Phase 3 · Shopify, Stores & Digital Commerce";
    if (programSlug === "graphics-designing") return "Phase 3 · Visual Identity, Branding & UI";
  }
  if (selectedPhase === "phase-2") {
    if (programSlug === "web-development") return "Module 2 · JavaScript & Modern Web";
    if (programSlug === "app-development") return "Module 2 · Flutter UI & Widgets";
    if (programSlug === "artificial-intelligence") return "Module 1 · AI Foundations & Python";
  }
  if (selectedPhase === "phase-1") {
    if (programSlug === "web-development") return "Module 1 · HTML5 & CSS3 Fundamentals";
    if (programSlug === "app-development") return "Module 1 · Dart Programming & OOP";
  }
  return null;
}

function getCoursePeriodStats(
  course: AdminRevenueCourseStats,
  period: RevenuePeriod
) {
  if (period === "week") {
    return {
      students: course.thisWeekCount,
      gross: course.thisWeekGross,
      management: course.thisWeekManagement,
      trainer: course.thisWeekTrainer,
      school: course.thisWeekSchool,
    };
  }
  if (period === "month") {
    return {
      students: course.thisMonthCount,
      gross: course.thisMonthGross,
      management: course.thisMonthManagement,
      trainer: course.thisMonthTrainer,
      school: course.thisMonthSchool,
    };
  }
  if (course.monthlyBreakdown && course.monthlyBreakdown.length > 0) {
    const found = course.monthlyBreakdown.find((m) => m.monthKey === period);
    if (found) {
      return {
        students: found.approvedCount,
        gross: found.gross,
        management: found.management,
        trainer: found.trainer,
        school: found.school,
      };
    }
  }
  return {
    students: course.approvedCount,
    gross: course.gross,
    management: course.managementShare,
    trainer: course.trainerShare,
    school: course.schoolShare,
  };
}

export function AdminRevenueProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<AdminRevenueStats | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/revenue");
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !stats && !loading) {
      void refresh();
    }
  }, [open, stats, loading, refresh]);

  return (
    <AdminRevenueContext.Provider value={{ open, setOpen, stats, loading, refresh }}>
      {children}
      <AdminRevenueSidePanel />
    </AdminRevenueContext.Provider>
  );
}

export function useAdminRevenue() {
  const ctx = useContext(AdminRevenueContext);
  if (!ctx) throw new Error("useAdminRevenue must be used within AdminRevenueProvider");
  return ctx;
}

export function useAdminRevenueOptional() {
  return useContext(AdminRevenueContext);
}

export function AdminRevenueHeaderButton() {
  const ctx = useAdminRevenueOptional();
  if (!ctx) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => ctx.setOpen(true)}
      className="gap-2 portal-revenue-trigger hover:opacity-95"
    >
      <CurrencyCircleDollar size={18} weight="duotone" />
      <span className="hidden sm:inline">Revenue</span>
    </Button>
  );
}

export function AdminRevenueSidebarCard({
  compact = false,
}: {
  compact?: boolean;
  dark?: boolean;
}) {
  const ctx = useAdminRevenueOptional();
  if (!ctx) return null;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => ctx.setOpen(true)}
        title="Revenue"
        aria-label="Open revenue panel"
        className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ease-out cursor-pointer select-none border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
      >
        <CurrencyCircleDollar size={20} weight="duotone" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(true)}
      className="w-full rounded-xl p-2.5 text-left transition-all duration-150 ease-out cursor-pointer select-none group border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-500/50 shadow-xs text-slate-900 dark:text-white"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-2xs bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/40 group-hover:scale-105 transition-transform">
          <CurrencyCircleDollar size={18} weight="duotone" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Revenue
            </p>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
              PKR
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
            Financial Overview
          </p>
        </div>
      </div>
    </button>
  );
}

function TrainerPaymentModal({
  course,
  studentCount,
  initialAmount,
  defaultTrainerEmail,
  phaseLabel,
  periodLabel,
  loading,
  onClose,
  onSubmit,
}: {
  course: AdminRevenueCourseStats;
  studentCount: number;
  initialAmount: number;
  defaultTrainerEmail?: string;
  phaseLabel: string;
  periodLabel: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    paidBy: string;
    paymentAccount: string;
    recipientAccount: string;
    transactionRef: string;
    receiptUrl?: string;
    receiptPublicId?: string;
    paidAt: string;
    note: string;
    trainerEmail: string;
    sendEmail: boolean;
  }) => Promise<void>;
}) {
  const getNowIsoLocal = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const [amount, setAmount] = useState<number>(initialAmount);
  const [paidBy, setPaidBy] = useState("Tatheer");
  const [paymentAccount, setPaymentAccount] = useState("Meezan Bank");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptPublicId, setReceiptPublicId] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [paidAt, setPaidAt] = useState(getNowIsoLocal());
  const [note, setNote] = useState("");
  const [trainerEmail, setTrainerEmail] = useState(defaultTrainerEmail || "");
  const [sendEmail, setSendEmail] = useState(true);

  const quickAccounts = [
    "Meezan Bank",
    "JazzCash",
    "Easypaisa",
    "HBL",
    "Sadapay",
    "Nayapay",
    "Bank Transfer",
    "Cash",
  ];

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadingReceipt(true);
    setUploadProgress(0);

    try {
      const res = await uploadDirectToCloudinary(file, {
        folder: "eest/trainer-payouts",
        onProgress: (p) => setUploadProgress(p),
      });
      setReceiptUrl(res.url);
      setReceiptPublicId(res.publicId);
      toast.success("Payment proof screenshot uploaded successfully!");
    } catch (err) {
      console.error("Receipt upload error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload receipt");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptUrl("");
    setReceiptPublicId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (!paidBy.trim()) {
      toast.error("Please enter who disbursed the payment");
      return;
    }
    await onSubmit({
      amount: Number(amount),
      paidBy: paidBy.trim(),
      paymentAccount: paymentAccount.trim(),
      recipientAccount: recipientAccount.trim(),
      transactionRef: transactionRef.trim(),
      receiptUrl: receiptUrl.trim() || undefined,
      receiptPublicId: receiptPublicId.trim() || undefined,
      paidAt,
      note: note.trim(),
      trainerEmail: trainerEmail.trim(),
      sendEmail,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <Wallet size={22} weight="duotone" />
            </div>
            <div>
              <h3 id="payment-modal-title" className="text-base font-bold text-slate-900">
                Disburse Trainer Salary
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {course.trainerName} · {course.courseTitle} ({phaseLabel})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Amount & Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (PKR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                  PKR
                </span>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-1.5 text-sm font-bold text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {studentCount} students mentored ({periodLabel})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Disbursed By <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                placeholder="e.g. Tatheer / Management"
                className="w-full px-3 py-1.5 text-sm font-medium text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Payment Account / Channel */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Paid From Account / Channel
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {quickAccounts.map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setPaymentAccount(acc)}
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer",
                    paymentAccount === acc
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {acc}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={paymentAccount}
              onChange={(e) => setPaymentAccount(e.target.value)}
              placeholder="e.g. Meezan Bank (A/C ...)"
              className="w-full px-3 py-1.5 text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Date & Time and Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-medium text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Transaction / Ref ID <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. TRX-9823412"
                className="w-full px-3 py-1.5 text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Recipient Account & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Recipient Account <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={recipientAccount}
                onChange={(e) => setRecipientAccount(e.target.value)}
                placeholder="Trainer's bank/wallet"
                className="w-full px-3 py-1.5 text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Remarks / Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special remarks..."
                className="w-full px-3 py-1.5 text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Proof of Payment Screenshot Upload */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Proof of Payment / Screenshot <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              {receiptUrl && (
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>

            {receiptUrl ? (
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-emerald-200">
                <img
                  src={receiptUrl}
                  alt="Payment Proof"
                  className="h-12 w-12 rounded-md object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle size={14} weight="fill" />
                    Screenshot Attached
                  </p>
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline truncate block mt-0.5"
                  >
                    View uploaded image
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white rounded-xl p-3.5 text-center cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    disabled={uploadingReceipt}
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                  {uploadingReceipt ? (
                    <div className="space-y-1 flex flex-col items-center">
                      <ArrowClockwise size={18} className="animate-spin text-emerald-600" />
                      <p className="text-xs font-bold text-slate-700">
                        Uploading screenshot... {uploadProgress > 0 ? `${uploadProgress}%` : ""}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5 flex flex-col items-center">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                        <Wallet size={16} weight="duotone" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        Click to upload payment screenshot
                      </p>
                      <p className="text-[10px] text-slate-400">
                        PNG, JPG or WEBP (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Email Notification Section */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <EnvelopeSimple size={15} weight="bold" className="text-emerald-700" />
                Send automated salary receipt email to trainer
              </span>
            </label>

            {sendEmail && (
              <div className="pt-0.5">
                <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                  Trainer Email Address
                </label>
                <input
                  type="email"
                  value={trainerEmail}
                  onChange={(e) => setTrainerEmail(e.target.value)}
                  placeholder="trainer@example.com"
                  className="w-full px-3 py-1.5 text-xs bg-white text-slate-900 rounded-lg border border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[10px] text-emerald-700 mt-1">
                  Official EEST remuneration receipt with complete breakdown will be emailed.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <ArrowClockwise size={13} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check size={13} weight="bold" />
                  <span>Confirm Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TrainerPaymentDetailModal({
  payout,
  course,
  phaseLabel,
  periodLabel,
  loading,
  onClose,
  onUnmark,
}: {
  payout: TrainerPayoutRecord;
  course: AdminRevenueCourseStats;
  phaseLabel: string;
  periodLabel: string;
  loading: boolean;
  onClose: () => void;
  onUnmark: () => Promise<void>;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const formattedDate = new Date(payout.paidAt).toLocaleString("en-PK", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle size={22} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {course.trainerName}
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Paid
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {course.courseTitle} · {phaseLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Amount Highlight */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-center">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Disbursed Amount
          </p>
          <p className="text-2xl font-black text-emerald-950 mt-0.5">
            PKR {payout.amount.toLocaleString("en-PK")}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {payout.studentCount} students mentored ({periodLabel})
          </p>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">Disbursed By</span>
            <span className="text-slate-900 font-bold">{payout.paidBy}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">Payment Channel</span>
            <span className="text-slate-900 font-bold">{payout.paymentAccount || "Direct Transfer"}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">Date & Time</span>
            <span className="text-slate-900 font-bold">{formattedDate}</span>
          </div>
          {payout.recipientAccount && (
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Recipient Account</span>
              <span className="text-slate-900 font-bold">{payout.recipientAccount}</span>
            </div>
          )}
          {payout.transactionRef && (
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Transaction / Ref</span>
              <span className="text-slate-900 font-mono font-bold">{payout.transactionRef}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">Email Notification</span>
            <span className="font-bold">
              {payout.emailSent ? (
                <span className="text-emerald-600 inline-flex items-center gap-1">
                  <EnvelopeSimple size={13} weight="bold" />
                  Sent ({payout.trainerEmail || "trainer"})
                </span>
              ) : (
                <span className="text-slate-400">Not dispatched</span>
              )}
            </span>
          </div>

          {/* Proof of Payment Screenshot in Detail Modal */}
          {payout.receiptUrl && (
            <div className="py-2 border-t border-slate-100">
              <span className="text-slate-500 font-semibold text-xs block mb-1.5">Proof of Payment</span>
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <img
                  src={payout.receiptUrl}
                  alt="Payment Receipt"
                  onClick={() => setLightboxOpen(true)}
                  className="h-14 w-14 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800">
                    Receipt Screenshot Attached
                  </p>
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline mt-0.5 cursor-pointer"
                  >
                    <span>Click to inspect full image</span>
                    <ArrowSquareOut size={12} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {payout.note && (
            <div className="py-1">
              <span className="text-slate-500 font-semibold block mb-0.5">Remarks</span>
              <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium">
                {payout.note}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={loading}
            onClick={onUnmark}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            {loading ? (
              <ArrowClockwise size={13} className="animate-spin" />
            ) : (
              <ArrowCounterClockwise size={13} weight="bold" />
            )}
            <span>Undo / Mark Unpaid</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {payout.receiptUrl && lightboxOpen && (
        <ImageLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          src={payout.receiptUrl}
          alt="Payment Receipt Screenshot"
          caption={`Payment Proof: ${course.trainerName} — PKR ${payout.amount.toLocaleString("en-PK")}`}
        />
      )}
    </div>
  );
}

function AdminRevenueSidePanel() {
  const { open, setOpen, stats, loading, refresh } = useAdminRevenue();
  const [period, setPeriod] = useState<RevenuePeriod>("all");
  const [selectedPhase, setSelectedPhase] = useState<"all" | "phase-1" | "phase-2" | "phase-3">("all");
  const [copiedPayout, setCopiedPayout] = useState(false);
  const [payouts, setPayouts] = useState<TrainerPayoutRecord[]>([]);
  const [trainerContacts, setTrainerContacts] = useState<Record<string, { email: string; name: string }>>({});
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const [payoutModalCourse, setPayoutModalCourse] = useState<{
    course: AdminRevenueCourseStats;
    studentCount: number;
    amount: number;
  } | null>(null);

  const [viewPayoutDetail, setViewPayoutDetail] = useState<{
    payout: TrainerPayoutRecord;
    course: AdminRevenueCourseStats;
  } | null>(null);

  const fetchPayouts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/revenue/payout");
      const json = await res.json();
      if (json.success && json.data) {
        if (Array.isArray(json.data.payouts)) {
          setPayouts(json.data.payouts);
        } else if (Array.isArray(json.data)) {
          setPayouts(json.data);
        }
        if (json.data.trainerContacts) {
          setTrainerContacts(json.data.trainerContacts);
        }
      }
    } catch (err) {
      console.error("Failed to load payouts:", err);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void fetchPayouts();
    }
  }, [open, fetchPayouts]);

  const handleConfirmPayout = async (formData: {
    amount: number;
    paidBy: string;
    paymentAccount: string;
    recipientAccount: string;
    transactionRef: string;
    receiptUrl?: string;
    receiptPublicId?: string;
    paidAt: string;
    note: string;
    trainerEmail: string;
    sendEmail: boolean;
  }) => {
    if (!payoutModalCourse) return;
    const { course, studentCount } = payoutModalCourse;
    setActionInProgress(course.programSlug);
    try {
      const res = await fetch("/api/admin/revenue/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programSlug: course.programSlug,
          phase: selectedPhase,
          period,
          amount: formData.amount,
          studentCount,
          trainerName: course.trainerName,
          trainerEmail: formData.trainerEmail,
          paidBy: formData.paidBy,
          paymentAccount: formData.paymentAccount,
          recipientAccount: formData.recipientAccount,
          transactionRef: formData.transactionRef,
          receiptUrl: formData.receiptUrl,
          receiptPublicId: formData.receiptPublicId,
          paidAt: formData.paidAt,
          note: formData.note,
          sendEmail: formData.sendEmail,
          courseTitle: course.courseTitle,
          phaseLabel:
            selectedPhase === "all"
              ? "All Phases"
              : selectedPhase === "phase-1"
              ? "Phase 1"
              : selectedPhase === "phase-2"
              ? "Phase 2"
              : "Phase 3",
          periodLabel: periodStats?.label || period,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const payoutRecord: TrainerPayoutRecord = json.data.payout || json.data;
        const emailStatus = json.data.emailStatus;

        if (emailStatus?.sent) {
          toast.success(
            `Marked ${course.trainerName} as Paid!`,
            `Receipt email sent to ${formData.trainerEmail || "trainer"}`
          );
        } else if (formData.sendEmail && emailStatus?.error) {
          toast.warning(
            `Marked ${course.trainerName} as Paid (PKR ${formData.amount.toLocaleString("en-PK")})`,
            `Email notice: ${emailStatus.error}`
          );
        } else {
          toast.success(
            `Marked ${course.trainerName} as Paid (PKR ${formData.amount.toLocaleString("en-PK")})`
          );
        }

        setPayouts((prev) => {
          const filtered = prev.filter(
            (p) =>
              !(
                p.programSlug === course.programSlug &&
                p.phase === selectedPhase &&
                p.period === period
              )
          );
          return [payoutRecord, ...filtered];
        });
        setPayoutModalCourse(null);
      } else {
        toast.error(json.error || "Failed to mark as paid");
      }
    } catch {
      toast.error("An error occurred while saving payout");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUnmarkPaid = async (payoutId: string, trainerName: string) => {
    if (!confirm(`Are you sure you want to mark ${trainerName} as unpaid?`)) return;
    setActionInProgress(payoutId);
    try {
      const res = await fetch(`/api/admin/revenue/payout?id=${payoutId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.info(`Marked ${trainerName} as unpaid`);
        setPayouts((prev) => prev.filter((p) => p.id !== payoutId));
        setViewPayoutDetail(null);
      } else {
        toast.error(json.error || "Failed to unmark payout");
      }
    } catch {
      toast.error("An error occurred while reverting payout");
    } finally {
      setActionInProgress(null);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const handlePhaseChange = (phase: "all" | "phase-1" | "phase-2" | "phase-3") => {
    setSelectedPhase(phase);
    // Auto-reset period to 'all' so earlier phase data is not masked
    setPeriod("all");
  };

  if (!open) return null;

  const activeStats: AdminRevenuePhaseStats | null = stats
    ? selectedPhase === "phase-1"
      ? stats.phases?.phase1 ?? stats
      : selectedPhase === "phase-2"
        ? stats.phases?.phase2 ?? stats
        : selectedPhase === "phase-3"
          ? stats.phases?.phase3 ?? stats
          : stats
    : null;

  const periodStats = activeStats ? getPeriodStats(activeStats, period, selectedPhase) : null;

  // Build intelligent period options based on the active phase
  const getPeriodOptions = () => {
    if (!stats || !activeStats) return [];
    const currentMonthLabel = new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date());

    if (selectedPhase === "phase-1") {
      const options: Array<{ key: string; label: string }> = [
        { key: "all", label: `All Phase 1 (${stats.phases.phase1.totalApproved})` },
      ];
      if (stats.phases.phase1.monthlyBreakdown) {
        for (const m of stats.phases.phase1.monthlyBreakdown) {
          options.push({ key: m.monthKey, label: `${m.label.split(" ")[0]} (${m.approvedCount})` });
        }
      }
      return options;
    }

    if (selectedPhase === "phase-2") {
      const options: Array<{ key: string; label: string }> = [
        { key: "all", label: `All Phase 2 (${stats.phases.phase2.totalApproved})` },
      ];
      if (stats.phases.phase2.monthlyBreakdown) {
        for (const m of stats.phases.phase2.monthlyBreakdown) {
          options.push({ key: m.monthKey, label: `${m.label.split(" ")[0]} (${m.approvedCount})` });
        }
      }
      options.push({ key: "week", label: `This week (${stats.phases.phase2.thisWeekApproved})` });
      return options;
    }

    if (selectedPhase === "phase-3") {
      const options: Array<{ key: string; label: string }> = [
        { key: "all", label: `All Phase 3 (${stats.phases.phase3?.totalApproved ?? 0})` },
      ];
      if (stats.phases.phase3?.monthlyBreakdown) {
        for (const m of stats.phases.phase3.monthlyBreakdown) {
          options.push({ key: m.monthKey, label: `${m.label.split(" ")[0]} (${m.approvedCount})` });
        }
      }
      options.push({ key: "week", label: `This week (${stats.phases.phase3?.thisWeekApproved ?? 0})` });
      return options;
    }

    // "all" phases
    return [
      { key: "all", label: `All time (${stats.totalApproved})` },
      { key: "month", label: `${currentMonthLabel} (${stats.thisMonthApproved})` },
      { key: "week", label: `This week (${stats.thisWeekApproved})` },
    ];
  };

  const periodOptions = getPeriodOptions();

  // Filter courses for active phase: Phase 1 (Web, App), Phase 2 & 3 (Web, App, AI), Phase 4 (Marketing, Ecommerce, Graphics)
  const coursesToDisplay = activeStats?.byCourse.filter((c) => {
    if (selectedPhase === "all") return true;
    return getProgramsForPhase(selectedPhase).includes(c.programSlug);
  });

  const handleCopyTrainerPayouts = () => {
    if (!coursesToDisplay || !periodStats || !stats) return;
    const rate = selectedPhase === "phase-1" ? 800 : 700;
    const lines = [
      `EEST Trainer Salary Payouts — ${periodStats.label}`,
      `Rate: PKR ${rate} per approved student`,
      `----------------------------------------`,
    ];
    for (const course of coursesToDisplay) {
      const cp = getCoursePeriodStats(course, period);
      const studentCount = period === "all" ? course.uniqueStudents : cp.students;
      const payout = payouts.find(
        (p) => p.programSlug === course.programSlug && p.phase === selectedPhase && p.period === period
      );
      const statusSuffix = payout ? " [PAID]" : "";
      lines.push(`${course.trainerName} (${course.courseTitle}): ${studentCount} students × PKR ${rate} = PKR ${cp.trainer.toLocaleString("en-PK")}${statusSuffix}`);
    }
    lines.push(`----------------------------------------`);
    lines.push(`Total Trainer Salaries Payable: PKR ${periodStats.trainer.toLocaleString("en-PK")}`);
    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedPayout(true);
    setTimeout(() => setCopiedPayout(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close revenue panel"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={() => setOpen(false)}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Registration Revenue"
        className="relative flex h-full w-full max-w-[540px] flex-col bg-white text-slate-900 shadow-2xl border-l border-slate-200 z-10"
      >
        {/* Top Header Card */}
        <div className="relative shrink-0 border-b border-slate-200/80 bg-white px-6 pt-5 pb-5">
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                <CurrencyCircleDollar size={26} weight="duotone" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                  Financial Overview
                </p>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Registration Revenue
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={loading}
                className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Refresh data"
              >
                <ArrowClockwise size={18} className={loading ? "animate-spin text-emerald-600" : ""} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
          </div>

          {/* Dynamic phase split explanation in clean, soft pastel cards */}
          {selectedPhase === "phase-1" ? (
            <div className="bg-indigo-50/80 border border-indigo-200/80 text-xs text-slate-700 leading-relaxed rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-indigo-700 uppercase text-[10px] tracking-wider bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md">
                  Phase 1 Model (Web & App 1st Module)
                </span>
                <span className="text-[11px] font-semibold text-indigo-800">
                  Rs 800 / student
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                PKR 1,000 → <strong className="text-slate-900">PKR 200</strong> Mgmt (Komal) · <strong className="text-indigo-700 font-bold">PKR 800</strong> Trainer (Tatheer / Talha) · <strong className="text-slate-900">PKR 0</strong> School
              </p>
            </div>
          ) : selectedPhase === "phase-2" ? (
            <div className="bg-emerald-50/80 border border-emerald-200/80 text-xs text-slate-700 leading-relaxed rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-emerald-700 uppercase text-[10px] tracking-wider bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Phase 2 Model (Web & App 2nd Module · AI 1st Module)
                </span>
                <span className="text-[11px] font-semibold text-emerald-800">
                  Rs 700 / student
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                PKR 1,000 → <strong className="text-slate-900">PKR 200</strong> Mgmt (Komal) · <strong className="text-emerald-700 font-bold">PKR 700</strong> Trainer (Tatheer / Talha / Faiza) · <strong className="text-slate-900">PKR 100</strong> School
              </p>
            </div>
          ) : selectedPhase === "phase-3" ? (
            <div className="bg-purple-50/80 border border-purple-200/80 text-xs text-slate-700 leading-relaxed rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-purple-700 uppercase text-[10px] tracking-wider bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-md">
                  Phase 3 Model (Web & App 3rd Module · AI 2nd Module)
                </span>
                <span className="text-[11px] font-semibold text-purple-800">
                  Rs 700 / student
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                PKR 1,000 → <strong className="text-slate-900">PKR 200</strong> Mgmt (Komal) · <strong className="text-purple-700 font-bold">PKR 700</strong> Trainer (Tatheer / Talha / Faiza) · <strong className="text-slate-900">PKR 100</strong> School
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed rounded-xl p-3.5 shadow-2xs">
              <span className="font-bold text-indigo-600">Phase 1:</span> Rs 200 Mgmt / Rs 800 Trainer · <span className="font-bold text-emerald-600">Phase 2:</span> Rs 200 Mgmt / Rs 700 Trainer / Rs 100 School · <span className="font-bold text-purple-600">Phase 3:</span> Rs 200 Mgmt / Rs 700 Trainer / Rs 100 School
            </div>
          )}
        </div>

        {/* Phase Filter Toggle Bar */}
        {stats && stats.phases && (
          <div className="shrink-0 border-b border-slate-200/80 bg-slate-50 px-6 py-2.5 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Module Phase
            </span>
            <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl shadow-xs border border-slate-200">
              <button
                type="button"
                onClick={() => handlePhaseChange("all")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "all"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                All ({stats.totalApproved})
              </button>
              <button
                type="button"
                onClick={() => handlePhaseChange("phase-1")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "phase-1"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Phase 1 ({stats.phases.phase1.totalApproved})
              </button>
              <button
                type="button"
                onClick={() => handlePhaseChange("phase-2")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "phase-2"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Phase 2 ({stats.phases.phase2.totalApproved})
              </button>
              <button
                type="button"
                onClick={() => handlePhaseChange("phase-3")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "phase-3"
                    ? "bg-purple-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Phase 3 ({stats.phases.phase3?.totalApproved ?? 0})
              </button>
          </div>
          </div>
        )}

        {/* Time Period Filter Bar */}
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-6 py-2.5 flex gap-2 overflow-x-auto">
          {periodOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPeriod(opt.key)}
              className={cn(
                "flex-1 min-w-[80px] rounded-xl py-2 px-2.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap text-center border",
                period === opt.key
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-slate-50/60">
          {loading && !stats && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ArrowClockwise size={32} className="animate-spin mb-3 text-emerald-600" />
              <p className="text-sm font-medium">Loading revenue data…</p>
            </div>
          )}

          {stats && periodStats && (
            <>
              {/* Gross Revenue Hero Card — Pure White Card with Soft Slate Accents */}
              <div className="rounded-2xl p-5 border border-slate-200 bg-white shadow-xs transition-all">
                <div className="flex items-center justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs border shadow-2xs",
                        selectedPhase === "phase-1"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : selectedPhase === "phase-2"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : selectedPhase === "phase-3"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                      )}
                    >
                      {selectedPhase === "phase-1" ? "P1" : selectedPhase === "phase-2" ? "P2" : selectedPhase === "phase-3" ? "P3" : "ALL"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-slate-900">
                        {periodStats.label}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Gross Revenue Collection</p>
                    </div>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs">
                    {periodStats.students} Paid Registrations
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl border border-slate-200/80 bg-slate-50 text-center mb-3.5">
                  <div>
                    <p className="text-xl font-bold tabular-nums text-slate-900">
                      {periodStats.students}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-600">Approved</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold tabular-nums text-slate-900">0</p>
                    <p className="text-[11px] font-semibold text-amber-600">Pending</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold tabular-nums text-slate-900">
                      {selectedPhase === "phase-1"
                        ? stats.phases.phase1.totalApproved
                        : selectedPhase === "phase-2"
                          ? stats.phases.phase2.totalApproved
                          : selectedPhase === "phase-3"
                            ? (stats.phases.phase3?.totalApproved ?? 0)
                            : periodStats.students}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">Active Students</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-1">
                  <span>Gross Collected</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">
                    {formatMoney(periodStats.gross, stats.currency)}
                  </span>
                </div>
              </div>

              {/* 3 Share Cards (Management, Trainers, School) — Soft Pastel Clean Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Management Card */}
                <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 border border-violet-200/60">
                      <Buildings size={15} weight="duotone" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                      Komal (Mgmt)
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                    {formatMoney(periodStats.management, stats.currency)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">
                    Rs 200 / student
                  </p>
                </div>

                {/* Trainer Card */}
                <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 border border-sky-200/60">
                      <GraduationCap size={15} weight="duotone" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                      Trainers
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                    {formatMoney(periodStats.trainer, stats.currency)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">
                    {selectedPhase === "phase-1" ? "Rs 800 / student" : "Rs 700 / student"}
                  </p>
                </div>

                {/* School Card */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                      <Buildings size={15} weight="duotone" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      School %
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                    {formatMoney(periodStats.school, stats.currency)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">
                    {selectedPhase === "phase-1" ? "Rs 0 (Phase 1)" : "Rs 100 / student"}
                  </p>
                </div>
              </div>

              {/* Distribution Bar */}
              {periodStats.gross > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Revenue Distribution Share
                  </p>
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 gap-0.5 p-0.5 border border-slate-200">
                    {periodStats.management > 0 && (
                      <div
                        className="bg-violet-600 rounded-sm transition-all"
                        style={{
                          width: `${(periodStats.management / periodStats.gross) * 100}%`,
                        }}
                        title={`Management: ${Math.round((periodStats.management / periodStats.gross) * 100)}%`}
                      />
                    )}
                    {periodStats.trainer > 0 && (
                      <div
                        className="bg-sky-600 rounded-sm transition-all"
                        style={{
                          width: `${(periodStats.trainer / periodStats.gross) * 100}%`,
                        }}
                        title={`Trainers: ${Math.round((periodStats.trainer / periodStats.gross) * 100)}%`}
                      />
                    )}
                    {periodStats.school > 0 && (
                      <div
                        className="bg-emerald-600 rounded-sm transition-all"
                        style={{
                          width: `${(periodStats.school / periodStats.gross) * 100}%`,
                        }}
                        title={`School: ${Math.round((periodStats.school / periodStats.gross) * 100)}%`}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap justify-between gap-1.5 mt-3 text-xs">
                    <span className="text-violet-700 font-bold flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-600" />
                      Management {Math.round((periodStats.management / periodStats.gross) * 100)}%
                    </span>
                    <span className="text-sky-700 font-bold flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-600" />
                      Trainers {Math.round((periodStats.trainer / periodStats.gross) * 100)}%
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      School {Math.round((periodStats.school / periodStats.gross) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Trainer Salary Payout Sheet — Designed for Immediate Payroll Execution */}
              <div className="rounded-2xl border border-sky-200 bg-white p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                      <Wallet size={16} weight="duotone" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Trainer Salary Payouts
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {selectedPhase === "phase-1" ? "Rs 800" : "Rs 700"} / student · {periodStats.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyTrainerPayouts}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer shadow-2xs"
                      title="Copy salary breakdown to clipboard"
                    >
                      {copiedPayout ? (
                        <>
                          <Check size={13} weight="bold" className="text-emerald-600" />
                          <span className="text-emerald-600 font-bold text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} weight="bold" className="text-slate-500" />
                          <span className="text-[11px]">Copy Slip</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg tabular-nums">
                      {formatMoney(periodStats.trainer, stats.currency)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
                  {coursesToDisplay?.map((course) => {
                    const cp = getCoursePeriodStats(course, period);
                    const studentCount = period === "all" ? course.uniqueStudents : cp.students;
                    const subtitle = getCoursePhaseModuleSubtitle(course.programSlug, selectedPhase);
                    const payout = payouts.find(
                      (p) =>
                        p.programSlug === course.programSlug &&
                        p.phase === selectedPhase &&
                        p.period === period
                    );
                    const isPaid = !!payout;
                    const isActing =
                      actionInProgress === course.programSlug ||
                      (payout && actionInProgress === payout.id);

                    return (
                      <div
                        key={course.programSlug}
                        className={cn(
                          "flex items-center justify-between p-3 transition-colors",
                          isPaid ? "bg-emerald-50/40 hover:bg-emerald-50/60" : "hover:bg-white"
                        )}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {course.trainerName}
                            </p>
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-slate-600">
                              {course.shortLabel}
                            </span>
                            {isPaid && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                <Check size={10} weight="bold" />
                                Paid
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {subtitle ?? course.courseTitle} · <span className="font-semibold text-slate-700">{studentCount} students</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-right">
                            <p
                              className={cn(
                                "text-xs sm:text-sm font-black tabular-nums",
                                isPaid ? "text-slate-400 line-through" : "text-slate-900"
                              )}
                            >
                              {formatMoney(cp.trainer, stats.currency)}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-semibold">
                              {isPaid ? "Paid" : "Payable Salary"}
                            </p>
                          </div>

                          {isPaid ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setViewPayoutDetail({ payout, course })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs select-none transition-all cursor-pointer"
                                title={`Paid by ${payout.paidBy} on ${new Date(payout.paidAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })} · Click to view record details`}
                              >
                                <Check size={12} weight="bold" />
                                Paid
                              </button>
                              <button
                                type="button"
                                disabled={Boolean(isActing)}
                                onClick={() => handleUnmarkPaid(payout.id, course.trainerName)}
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                title="Undo / Mark as Unpaid"
                              >
                                {isActing ? (
                                  <ArrowClockwise size={12} className="animate-spin text-rose-500" />
                                ) : (
                                  <ArrowCounterClockwise size={12} weight="bold" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={Boolean(isActing) || cp.trainer === 0}
                              onClick={() =>
                                setPayoutModalCourse({
                                  course,
                                  studentCount,
                                  amount: cp.trainer,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Record payment details for this trainer"
                            >
                              <Check size={12} weight="bold" className="text-emerald-600" />
                              <span>Mark Paid</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Course-wise Breakdown */}
              <div className="space-y-3 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 px-0.5">
                  Course-wise Breakdown
                </p>
                <div className="space-y-3.5">
                  {coursesToDisplay?.map((course) => {
                    const cp = getCoursePeriodStats(course, period);
                    const trainerShort = course.trainerName.split(" ").slice(-1)[0];
                    const subtitle = getCoursePhaseModuleSubtitle(course.programSlug, selectedPhase);
                    return (
                      <div
                        key={course.programSlug}
                        className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs transition-all hover:shadow-xs"
                      >
                        <div
                          className={cn(
                            "px-4 py-3 bg-gradient-to-r text-white shadow-xs",
                            course.headerGradient
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-sm tracking-tight text-white">{course.courseTitle}</p>
                              {subtitle && (
                                <p className="text-[11px] text-white/90 font-medium">
                                  {subtitle}
                                </p>
                              )}
                              <p className="text-xs text-white/90 mt-0.5 font-medium">
                                Trainer: {course.trainerName}
                              </p>
                            </div>
                            <div className="text-right shrink-0 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/20">
                              <p className="text-base sm:text-lg font-black text-white">
                                {period === "all" ? course.uniqueStudents : cp.students}
                              </p>
                              <p className="text-[9px] uppercase tracking-wider text-white/90 font-bold">
                                {period === "all" ? "unique students" : "registrations"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 space-y-3.5 bg-white">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 font-semibold">Gross Collected</span>
                            <span className="font-black text-slate-900 text-base sm:text-lg tabular-nums">
                              {formatMoney(cp.gross, stats.currency)}
                            </span>
                          </div>
                          <div className="h-px bg-slate-100" />
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-xl border border-violet-200/70 bg-violet-50/70 p-2.5 text-center">
                              <p className="text-[9px] font-bold uppercase text-violet-700">
                                Management
                              </p>
                              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 tabular-nums">
                                {formatMoney(cp.management, stats.currency)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-sky-200/70 bg-sky-50/70 p-2.5 text-center">
                              <p className="text-[9px] font-bold uppercase text-sky-700">
                                {trainerShort}
                              </p>
                              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 tabular-nums">
                                {formatMoney(cp.trainer, stats.currency)}
                              </p>
                              {payouts.some(
                                (p) =>
                                  p.programSlug === course.programSlug &&
                                  p.phase === selectedPhase &&
                                  p.period === period
                              ) && (
                                <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  Paid
                                </span>
                              )}
                            </div>
                            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-2.5 text-center">
                              <p className="text-[9px] font-bold uppercase text-emerald-700">
                                School
                              </p>
                              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 tabular-nums">
                                {formatMoney(cp.school, stats.currency)}
                              </p>
                            </div>
                          </div>

                          {period === "all" && course.approvedCount !== course.uniqueStudents && (
                            <div className="text-xs rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                              {course.approvedCount} paid registration
                              {course.approvedCount === 1 ? "" : "s"} (
                              {course.approvedCount - course.uniqueStudents} returning / repeat enrollments)
                            </div>
                          )}
                          {period === "all" && course.thisWeekCount > 0 && (
                            <div className="text-xs rounded-xl px-3 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                              +{course.thisWeekCount} new this week (
                              {formatMoney(course.thisWeekGross, stats.currency)} gross)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Phase 1 AI Notice */}
                  {selectedPhase === "phase-1" && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center bg-slate-50">
                      <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                        <Sparkle size={15} weight="duotone" className="text-purple-500 shrink-0" />
                        Artificial Intelligence program was launched in Phase 2
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {payoutModalCourse && (
        <TrainerPaymentModal
          course={payoutModalCourse.course}
          studentCount={payoutModalCourse.studentCount}
          initialAmount={payoutModalCourse.amount}
          defaultTrainerEmail={trainerContacts[payoutModalCourse.course.programSlug]?.email}
          phaseLabel={
            selectedPhase === "all"
              ? "All Phases"
              : selectedPhase === "phase-1"
              ? "Phase 1"
              : selectedPhase === "phase-2"
              ? "Phase 2"
              : "Phase 3"
          }
          periodLabel={periodStats?.label || period}
          loading={actionInProgress === payoutModalCourse.course.programSlug}
          onClose={() => setPayoutModalCourse(null)}
          onSubmit={handleConfirmPayout}
        />
      )}

      {viewPayoutDetail && (
        <TrainerPaymentDetailModal
          payout={viewPayoutDetail.payout}
          course={viewPayoutDetail.course}
          phaseLabel={
            selectedPhase === "all"
              ? "All Phases"
              : selectedPhase === "phase-1"
              ? "Phase 1"
              : selectedPhase === "phase-2"
              ? "Phase 2"
              : "Phase 3"
          }
          periodLabel={periodStats?.label || period}
          loading={actionInProgress === viewPayoutDetail.payout.id}
          onClose={() => setViewPayoutDetail(null)}
          onUnmark={() =>
            handleUnmarkPaid(
              viewPayoutDetail.payout.id,
              viewPayoutDetail.course.trainerName
            )
          }
        />
      )}
    </div>
  );
}
