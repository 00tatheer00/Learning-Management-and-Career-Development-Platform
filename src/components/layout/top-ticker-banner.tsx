"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronRight } from "lucide-react";
import { REGISTRATION_OPEN } from "@/lib/constants";

const tickerItems = [
  "🔥 Admissions Open — 2nd Module",
  "⚡ Live Interactive Classes & Assignments",
  "🚀 Limited Seats — Apply Before July 31",
  "💻 Web · App · AI · Graphics · UI/UX",
  "🎓 100% Free Course · Minimal Registration Fee Only",
];

// Repeated for seamless infinite loop
const repeated = [...tickerItems, ...tickerItems, ...tickerItems];

export function TopTickerBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !REGISTRATION_OPEN) return null;

  return (
    <div
      className="relative z-50 overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(90deg, #0f0f0f 0%, #1a1a1a 30%, #111111 70%, #0f0f0f 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Subtle top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, #f97316 30%, #fb923c 50%, #f97316 70%, transparent 100%)",
          opacity: 0.7,
        }}
      />

      <div className="flex items-center h-9">
        {/* Left: LIVE badge */}
        <div
          className="shrink-0 flex items-center gap-2 px-4 h-full"
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full"
              style={{ backgroundColor: "#f97316", opacity: 0.75 }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ backgroundColor: "#fb923c" }}
            />
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "#fb923c", letterSpacing: "0.18em" }}
          >
            Latest
          </span>
        </div>

        {/* Center: Scrolling Ticker */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          {/* Left fade */}
          <div
            className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: "40px",
              background:
                "linear-gradient(to right, #111111 0%, transparent 100%)",
            }}
          />
          {/* Right fade */}
          <div
            className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: "40px",
              background:
                "linear-gradient(to left, #111111 0%, transparent 100%)",
            }}
          />

          <div
            className="flex items-center whitespace-nowrap"
            style={{
              animation: "ticker-scroll 55s linear infinite",
            }}
          >
            {repeated.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center"
                style={{ padding: "0 2.5rem" }}
              >
                <span
                  className="text-[11px] font-medium tracking-wide"
                  style={{ color: "rgba(255,255,255,0.78)" }}
                >
                  {item}
                </span>
                {/* Separator dot */}
                <span
                  className="ml-10"
                  style={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    backgroundColor: "#f97316",
                    opacity: 0.5,
                    display: "inline-block",
                  }}
                />
              </span>
            ))}
          </div>
        </div>

        {/* Right: CTA + Close */}
        <div
          className="shrink-0 flex items-center gap-2 px-3 h-full"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 hover:opacity-80"
            style={{
              background: "linear-gradient(135deg, #f97316, #fb923c)",
              color: "#fff",
              padding: "3px 12px",
              borderRadius: "999px",
              letterSpacing: "0.12em",
            }}
          >
            <span>Apply Now</span>
            <ChevronRight size={10} className="stroke-[3]" />
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              width: "22px",
              height: "22px",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.45)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
            }}
            aria-label="Close notification ticker"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
