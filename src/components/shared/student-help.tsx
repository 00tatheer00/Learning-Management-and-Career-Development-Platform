"use client";

import Link from "next/link";
import { WhatsappLogo, Question } from "@phosphor-icons/react";
import { HELP_CONFIG, SIMPLE_STEPS } from "@/lib/constants/help";
import { cn } from "@/lib/utils";

interface HelpWhatsAppProps {
  className?: string;
}

export function HelpWhatsApp({ className }: HelpWhatsAppProps) {
  return (
    <a
      href={HELP_CONFIG.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 text-white font-semibold shadow-lg shadow-[#25D366]/30 hover:scale-105 transition-transform",
        className
      )}
      aria-label={`Get help on WhatsApp — ${HELP_CONFIG.whatsappDisplay}`}
      title={`WhatsApp: ${HELP_CONFIG.whatsappNumber}`}
    >
      <WhatsappLogo size={24} weight="fill" />
      <span className="hidden sm:inline">Need Help?</span>
      <span className="sm:hidden">Help</span>
    </a>
  );
}

interface SimpleStepsBannerProps {
  className?: string;
}

export function SimpleStepsBanner({ className }: SimpleStepsBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-primary/25 bg-primary/5 p-5 sm:p-6",
        className
      )}
    >
      <p className="text-base sm:text-lg font-bold text-foreground mb-4">
        Registration is easy — only 3 steps:
      </p>
      <ol className="space-y-3">
        {SIMPLE_STEPS.map((item) => (
          <li key={item.step} className="flex gap-3 items-start">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {item.step}
            </span>
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted flex items-start gap-2">
        <Question size={18} weight="duotone" className="text-primary shrink-0 mt-0.5" />
        Stuck? Tap the green{" "}
        <strong className="text-foreground">Need Help?</strong> button anytime, or{" "}
        <Link href="/contact" className="text-primary font-medium underline">
          contact us
        </Link>
        .
      </p>
    </div>
  );
}
