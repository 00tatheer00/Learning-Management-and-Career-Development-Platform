"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { X, ChevronRight, Zap } from "lucide-react";
import { REGISTRATION_OPEN } from "@/lib/constants";

const tickerItems = [
  "🔥 Admissions Open — 2nd Module Now Enrolling",
  "⚡ Live Interactive Classes & Weekly Assignments",
  "🚀 Limited Seats — Apply Before July 31",
  "💻 Web Development · App Dev · AI · Graphics · UI/UX",
  "🎓 100% Free Course — Only Minimal Registration Fee",
  "🏆 Hands-On Projects · Real-World Skills · Certified Trainers",
];

export function TopTickerBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    if (trackRef.current) {
      const width = trackRef.current.scrollWidth;
      // ~100px per second
      setDuration(Math.max(40, width / 100));
    }
  }, []);

  if (!isVisible || !REGISTRATION_OPEN) return null;

  // Triple for seamless loop
  const loopItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div
      className="relative z-50 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fef3c7 70%, #fff7ed 100%)",
        borderBottom: "1px solid rgba(234,88,12,0.15)",
        boxShadow: "0 1px 8px rgba(234,88,12,0.08)",
      }}
    >
      {/* Top orange accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, #ea580c 20%, #f97316 50%, #fb923c 70%, transparent 100%)",
        }}
      />

      <div className="flex items-stretch h-9">

        {/* LEFT: Live badge */}
        <div
          className="shrink-0 flex items-center gap-2 px-4"
          style={{
            borderRight: "1px solid rgba(234,88,12,0.12)",
            background: "linear-gradient(90deg, rgba(234,88,12,0.06) 0%, transparent 100%)",
          }}
        >
          {/* Pulse dot */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full"
              style={{ backgroundColor: "#f97316", opacity: 0.6 }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: "#ea580c" }}
            />
          </span>
          <Zap
            size={10}
            fill="#ea580c"
            strokeWidth={0}
          />
          <span
            className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap"
            style={{ color: "#ea580c" }}
          >
            Live News
          </span>
        </div>

        {/* CENTER: Infinite scrolling ticker */}
        <div className="relative flex-1 overflow-hidden flex items-center">
          {/* Left fade mask */}
          <div
            className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: "48px",
              background: "linear-gradient(to right, #ffedd5 0%, transparent 100%)",
            }}
          />
          {/* Right fade mask */}
          <div
            className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: "48px",
              background: "linear-gradient(to left, #ffedd5 0%, transparent 100%)",
            }}
          />

          <div
            ref={trackRef}
            className="flex items-center whitespace-nowrap"
            style={{
              animation: `ticker-scroll-ltr ${duration}s linear infinite`,
              willChange: "transform",
            }}
          >
            {loopItems.map((item, idx) => (
              <span key={idx} className="inline-flex items-center">
                <span
                  className="text-[11.5px] font-semibold tracking-wide px-7"
                  style={{ color: "#7c2d12" }}
                >
                  {item}
                </span>
                {/* Orange diamond separator */}
                <span
                  style={{
                    display: "inline-block",
                    width: "4px",
                    height: "4px",
                    borderRadius: "1px",
                    transform: "rotate(45deg)",
                    backgroundColor: "#f97316",
                    opacity: 0.55,
                    flexShrink: 0,
                  }}
                />
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: CTA + Close */}
        <div
          className="shrink-0 flex items-center gap-2 px-3"
          style={{
            borderLeft: "1px solid rgba(234,88,12,0.12)",
            background: "linear-gradient(90deg, transparent 0%, rgba(234,88,12,0.05) 100%)",
          }}
        >
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-px active:translate-y-0"
            style={{
              background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
              padding: "4px 13px 4px 12px",
              borderRadius: "999px",
              boxShadow: "0 2px 8px rgba(234,88,12,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              letterSpacing: "0.1em",
            }}
          >
            <span>Apply Now</span>
            <ChevronRight size={10} strokeWidth={3} />
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              width: "22px",
              height: "22px",
              background: "rgba(234,88,12,0.08)",
              color: "#b45309",
              border: "1px solid rgba(234,88,12,0.12)",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(234,88,12,0.16)";
              e.currentTarget.style.color = "#ea580c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(234,88,12,0.08)";
              e.currentTarget.style.color = "#b45309";
            }}
            aria-label="Close notification ticker"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes ticker-scroll-ltr {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
