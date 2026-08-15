import { verifyCertificateByCode } from "@/lib/certificates/certificate-service";
import Link from "next/link";
import {
  SealCheck,
  WarningCircle,
  CalendarCheck,
  GraduationCap,
  Sparkle,
  ArrowLeft,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Verify Certificate | EEST Portal",
  description: "Public certificate verification page for Emerging Edge School of Technology.",
};

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export default async function PublicVerifyCodePage({ params }: VerifyPageProps) {
  const { code } = await params;
  const cert = await verifyCertificateByCode(code);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950 text-white flex items-center justify-center p-4 sm:p-6 pt-28 pb-20">
      <div className="w-full max-w-2xl">
        {/* Top Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Verify another code
          </Link>

          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500/90 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Official EEST Certificate
          </span>
        </div>

        {cert ? (
          /* CERTIFICATE VERIFIED CARD */
          <div className="relative overflow-hidden rounded-3xl bg-zinc-900/90 border-2 border-emerald-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg">
                  <SealCheck size={32} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                      Official Document
                    </span>
                    <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
                    CERTIFICATE VERIFIED
                  </h1>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block">
                  Verification Code
                </span>
                <span className="text-sm font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 inline-block mt-1">
                  {cert.verificationCode}
                </span>
              </div>
            </div>

            {/* Main Certificate Data Grid */}
            <div className="mt-6 space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                  Student Name
                </span>
                <h2 className="text-3xl font-black text-white tracking-tight font-serif italic text-amber-200">
                  {cert.studentName}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
                <div className="rounded-2xl bg-zinc-950/60 p-4 border border-zinc-800">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
                    <GraduationCap size={16} className="text-amber-500" />
                    Course Name
                  </span>
                  <p className="text-base font-bold text-white">{cert.courseTitle}</p>
                </div>

                <div className="rounded-2xl bg-zinc-950/60 p-4 border border-zinc-800">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Sparkle size={16} className="text-amber-500" />
                    Module Completed
                  </span>
                  <p className="text-base font-bold text-amber-400">{cert.moduleName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-zinc-950/60 p-4 border border-zinc-800">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
                    <CalendarCheck size={16} className="text-emerald-400" />
                    Date of Completion
                  </span>
                  <p className="text-sm font-semibold text-zinc-200">{cert.completionDateLabel}</p>
                </div>

                <div className="rounded-2xl bg-zinc-950/60 p-4 border border-zinc-800">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                    Issuing Authority
                  </span>
                  <p className="text-sm font-semibold text-zinc-200">
                    Emerging Edge School of Technology (EEST)
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-8 border-t border-zinc-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2">
              <span>Verified online via EEST Public Verification System</span>
              <span className="text-zinc-400 font-mono text-[11px]">ID: {cert.certificateId}</span>
            </div>
          </div>
        ) : (
          /* CERTIFICATE NOT FOUND CARD */
          <div className="rounded-3xl bg-zinc-900/90 border-2 border-red-500/40 p-8 shadow-2xl text-center backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 mb-4">
              <WarningCircle size={36} weight="fill" />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white mb-2">
              CERTIFICATE NOT FOUND
            </h1>
            <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
              The verification code <span className="font-mono text-red-400 font-bold">{code}</span> could not be found in our official registry. Please verify the code and try again.
            </p>

            <Link
              href="/verify"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-lg"
            >
              Try Another Code
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
