"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, X, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { REGISTRATION_OPEN } from "@/lib/constants";

export function TopTickerBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !REGISTRATION_OPEN) return null;

  const tickerItems = [
    "🔥 ADMISSIONS OPEN FOR 2ND MODULE!",
    "⚡ LIVE INTERACTIVE CLASSES & ASSIGNMENTS",
    "🚀 LIMITED SEATS AVAILABLE — APPLY BEFORE JULY 31",
    "💻 WEB, APP, AI, GRAPHICS & UI/UX COURSES",
    "🎓 COURSE IS 100% FREE (ONLY MODULE REGISTRATION FEE)",
  ];

  return (
    <div className="relative z-50 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white text-xs font-bold shadow-md overflow-hidden">
      <div className="container-custom flex items-center justify-between h-9 px-3 sm:px-6">
        {/* Left Live Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-black/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-90" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="text-[10px] uppercase tracking-widest font-black text-amber-200 flex items-center gap-1">
            <Flame size={11} className="text-amber-300 fill-amber-300 animate-bounce" />
            <span>NEWS</span>
          </span>
        </div>

        {/* Center Infinite Marquee / Ticker */}
        <div className="relative flex-1 overflow-hidden mx-3 sm:mx-6 h-full flex items-center">
          <motion.div
            className="flex whitespace-nowrap gap-8 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 22,
            }}
          >
            {/* Double the array for seamless infinite loop */}
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-3 text-[11px] sm:text-xs tracking-wide">
                <Sparkles size={12} className="text-amber-300 shrink-0" />
                <span className="font-extrabold drop-shadow-sm">{item}</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right CTA Button & Close */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center gap-1 bg-white text-orange-600 hover:bg-amber-100 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow transition-all duration-200 hover:scale-105"
          >
            <span>APPLY NOW</span>
            <ArrowRight size={11} className="stroke-[3]" />
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
            aria-label="Close notification ticker"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
