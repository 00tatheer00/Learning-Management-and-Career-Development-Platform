import {
  WhatsappLogo,
  VideoCamera,
  PlayCircle,
  Exam,
  ClipboardText,
  Code,
  ShieldCheck,
} from "@phosphor-icons/react";
import { PAYMENT_CONFIG } from "@/lib/constants/payment";
import { cn } from "@/lib/utils";

const ACCESS_ICONS = [
  WhatsappLogo,
  VideoCamera,
  PlayCircle,
  Exam,
  ClipboardText,
  Code,
] as const;

interface RegistrationAccessInfoProps {
  className?: string;
}

export function RegistrationAccessInfo({ className }: RegistrationAccessInfoProps) {
  const { postRegistrationAccess } = PAYMENT_CONFIG;

  return (
    <div
      className={cn(
        "rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-orange-50/50 p-5 lg:p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700">
          <ShieldCheck size={22} weight="duotone" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground leading-snug">
            {postRegistrationAccess.title}
          </h3>
          <p className="mt-1 text-sm text-muted leading-relaxed">
            {postRegistrationAccess.subtitle}
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {postRegistrationAccess.items.map((item, index) => {
          const Icon = ACCESS_ICONS[index] ?? ShieldCheck;
          return (
            <li
              key={item}
              className="flex items-center gap-3 rounded-lg border border-border/70 bg-white/80 px-3.5 py-3"
            >
              <Icon size={20} weight="duotone" className="shrink-0 text-primary" />
              <span className="text-sm font-medium text-foreground leading-snug">{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
