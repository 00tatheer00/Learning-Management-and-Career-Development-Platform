import Image from "next/image";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const LOGO_PATH = SITE_CONFIG.logo;

type SiteLogoVariant = "navbar" | "footer" | "login" | "portal";

const variantClasses: Record<SiteLogoVariant, string> = {
  navbar: "h-12 sm:h-14 lg:h-16",
  footer: "h-14 sm:h-16",
  login: "h-16 sm:h-20",
  portal: "h-8",
};

interface SiteLogoProps {
  variant?: SiteLogoVariant;
  className?: string;
  href?: string | null;
  priority?: boolean;
  onDark?: boolean;
}

export function SiteLogo({
  variant = "navbar",
  className,
  href = "/",
  priority = false,
  onDark = false,
}: SiteLogoProps) {
  const image = (
    <Image
      src={LOGO_PATH}
      alt={`${SITE_CONFIG.shortName} — ${SITE_CONFIG.name}`}
      width={480}
      height={120}
      className={cn("w-auto object-contain", variantClasses[variant], className)}
      priority={priority}
    />
  );

  const wrapped = onDark ? (
    <span className="inline-flex rounded-lg bg-white px-2 py-1 shadow-sm">{image}</span>
  ) : (
    image
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0" aria-label={`${SITE_CONFIG.shortName} home`}>
        {wrapped}
      </Link>
    );
  }

  return <div className="inline-flex shrink-0">{wrapped}</div>;
}
