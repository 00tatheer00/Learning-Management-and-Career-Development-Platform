import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

const footerLinks = {
  programs: [
    { label: "Web Development", href: "/programs/web-development" },
    { label: "Flutter Development", href: "/programs/flutter-development" },
    { label: "Artificial Intelligence", href: "/programs/artificial-intelligence" },
    { label: "UI/UX Design", href: "/programs/ui-ux-design" },
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
      <div className="container-custom section-padding pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group/logo">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/25 transition-all duration-300 group-hover/logo:shadow-md group-hover/logo:shadow-primary/15">
                <GraduationCap className="w-5 h-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight block">
                  EMERGING EDGE
                </span>
                <span className="text-[10px] text-muted tracking-widest uppercase">
                  School of Technology
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted leading-relaxed mb-6 max-w-sm">
              {SITE_CONFIG.description.slice(0, 160)}...
            </p>
            <p className="text-lg font-semibold gradient-text mb-4">
              {SITE_CONFIG.tagline}
            </p>
            <div className="space-y-2 text-sm text-muted">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                {SITE_CONFIG.email}
              </a>
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                {SITE_CONFIG.phone}
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                {SITE_CONFIG.address}
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
          <div className="flex items-center gap-4">
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
