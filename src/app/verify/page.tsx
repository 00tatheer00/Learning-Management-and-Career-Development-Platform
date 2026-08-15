"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, SealCheck, ShieldCheck, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

export default function PublicVerifySearchPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950 text-white flex items-center justify-center p-4 sm:p-6 pt-28 pb-20">
      <div className="w-full max-w-xl text-center space-y-8">
        {/* Header Branding */}
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg">
            <SealCheck size={36} weight="fill" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Certificate Verification Portal
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Verify official module certificates issued by Emerging Edge School of Technology (EEST).
          </p>
        </div>

        {/* Verification Form Card */}
        <form
          onSubmit={handleVerify}
          className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-5 text-left backdrop-blur-xl"
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Enter Verification Code
          </label>

          <div className="relative">
            <MagnifyingGlass
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. EEST26-WEB-M1-0001"
              className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-3.5 text-base font-mono font-bold text-amber-400 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-amber-500 py-3.5 px-6 font-bold text-slate-950 hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98"
          >
            <ShieldCheck size={20} weight="fill" />
            Verify Certificate
            <ArrowRight size={18} weight="bold" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">
            Return to Portal
          </Link>
          <span>•</span>
          <span>Emerging Edge School of Technology</span>
        </div>
      </div>
    </main>
  );
}
