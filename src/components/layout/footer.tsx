import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { getOfficialTelHref } from "@/lib/constants/contact";
import { SiteLogo } from "@/components/shared/site-logo";

const footerLinks = {
  programs: [
    { label: "Web Development", href: "/programs/web-development" },
    { label: "App Development", href: "/programs/app-development" },
    { label: "Artificial Intelligence", href: "/programs/artificial-intelligence" },
    { label: "Video Editing", href: "/programs/video-editing" },
    { label: "Digital Marketing", href: "/programs/digital-marketing" },
    { label: "Graphics Designing", href: "/programs/graphics-designing" },
    { label: "UI/UX Designing", href: "/programs/ui-ux-design" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "Events", href: "/events" },
    { label: "Student Portal", href: "/student-portal" },
    { label: "FAQ", href: "/#faq" },
  ],
  admissions: [
    { label: "How to Apply", href: "/admissions" },
    { label: "Eligibility", href: "/admissions#eligibility" },
    { label: "Register", href: "/register" },
    { label: "Learning Paths", href: "/programs#learning-paths" },
  ],
  contact: [
    { label: "Contact Us", href: "/contact" },
    { label: "About Us", href: "/about" },
    { label: "Trainers", href: "/trainers" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface section-alt" role="contentinfo">
      <div className="container-custom px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <SiteLogo variant="footer" className="mb-4" />
            <p className="text-sm text-muted leading-relaxed mb-6 max-w-sm">
              {SITE_CONFIG.description.slice(0, 160)}...
            </p>
            <p className="text-lg font-semibold gradient-text mb-4">
              {SITE_CONFIG.tagline}
            </p>
            <div className="space-y-2 text-sm text-muted">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 hover:text-primary transition-colors min-w-0"
              >
                <Mail className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="break-all">{SITE_CONFIG.email}</span>
              </a>
              <a
                href={getOfficialTelHref()}
                className="flex items-center gap-2 hover:text-primary transition-colors min-w-0"
              >
                <Phone className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="break-words">{SITE_CONFIG.phone}</span>
              </a>
              <span className="flex items-start gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
                <span className="break-words">{SITE_CONFIG.address}</span>
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 capitalize">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2">
            {Object.entries(SITE_CONFIG.social).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-primary transition-colors capitalize"
                aria-label={`Follow us on ${platform}`}
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
