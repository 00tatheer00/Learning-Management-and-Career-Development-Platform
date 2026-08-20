"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  SealCheck,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  FileText,
  LockKey,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function PublicVerifySearchPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  const handleExampleClick = (exampleCode: string) => {
    setCode(exampleCode);
    router.push(`/verify/${encodeURIComponent(exampleCode)}`);
  };

  return (
    <div className="py-12 sm:py-20 lg:py-24">
      <div className="container-custom max-w-4xl px-4 sm:px-6">
        {/* Main Search Hero Box */}
        <div className="text-center space-y-5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            <SealCheck size={16} weight="fill" />
            Official Credential Registry
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Verify Certificate & Academic Credentials
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            Instant online verification for official module certificates issued by{" "}
            <span className="font-semibold text-foreground">Emerging Edge School of Technology</span>.
          </p>
        </div>

        {/* Verification Input Form Card */}
        <div className="mt-10 max-w-2xl mx-auto">
          <form
            onSubmit={handleVerify}
            className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6"
          >
            <div className="space-y-2">
              <label
                htmlFor="verification-input"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Enter Verification Code
              </label>

              <div className="relative">
                <MagnifyingGlass
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  id="verification-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EEST26-WEB-M1-0001"
                  autoCapitalize="characters"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full rounded-2xl border border-input bg-background pl-12 pr-4 py-3.5 sm:py-4 text-base sm:text-lg font-mono font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all uppercase"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base py-6 shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              <ShieldCheck size={22} weight="fill" />
              Verify Credential
              <ArrowRight
                size={18}
                weight="bold"
                className="transition-transform group-hover:translate-x-1"
              />
            </Button>

            {/* Quick Demo Example */}
            <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Code format: <code className="font-mono font-bold text-foreground">EEST26-[PROG]-[MOD]-[ID]</code></span>
              <button
                type="button"
                onClick={() => handleExampleClick("EEST26-WEB-M1-0001")}
                className="font-medium text-primary hover:underline"
              >
                Try sample: <span className="font-mono">EEST26-WEB-M1-0001</span>
              </button>
            </div>
          </form>
        </div>

        {/* Feature Grid / Trust Indicators */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <CheckCircle size={24} weight="fill" />
            </div>
            <h3 className="text-base font-bold text-foreground">100% Authentic Registry</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every certificate is cryptographically recorded in the central Emerging Edge registry upon module completion.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FileText size={24} weight="fill" />
            </div>
            <h3 className="text-base font-bold text-foreground">High-Res Print PDF</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Employers and recruiters can instantly inspect and download official print-ready vector PDF certificates.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <LockKey size={24} weight="fill" />
            </div>
            <h3 className="text-base font-bold text-foreground">Tamper-Proof IDs</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unique sequential credential identifiers prevent forgery and ensure reliable third-party verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
