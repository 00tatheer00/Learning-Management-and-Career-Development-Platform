"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X, GraduationCap } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 pointer-events-auto transition-[background-color,box-shadow,backdrop-filter] duration-200",
        isScrolled ? "glass-strong shadow-sm" : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <nav
        className="container-custom flex items-center justify-between h-16 lg:h-20 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          prefetch
          className="flex items-center gap-2.5 group/logo relative z-10"
          aria-label="Home"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/25 shadow-sm transition-shadow duration-200 group-hover/logo:shadow-md">
            <GraduationCap size={22} weight="duotone" className="text-primary" aria-hidden="true" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold tracking-tight leading-tight block">
              EMERGING EDGE
            </span>
            <span className="text-[10px] text-muted tracking-widest uppercase">
              School of Technology
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-1 relative z-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                pathname === link.href.split("#")[0] ||
                  (link.href !== "/" && pathname.startsWith(link.href.split("#")[0]))
                  ? "text-primary font-semibold bg-primary/5"
                  : "text-muted hover:text-foreground hover:bg-secondary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3 relative z-10">
          <Button variant="outline" size="sm" asChild>
            <Link href="/student-portal" prefetch>
              Student Login
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register" prefetch>
              Apply Now
            </Link>
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors relative z-10"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
        </button>
      </nav>

      {isMobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 bg-black/30 lg:hidden z-40"
            aria-label="Close menu overlay"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="lg:hidden glass-strong border-t border-border relative z-50">
            <div className="container-custom px-4 py-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  className="px-4 py-3 text-base rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                <Button variant="outline" asChild>
                  <Link href="/student-portal" prefetch onClick={() => setIsMobileOpen(false)}>
                    Student Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register" prefetch onClick={() => setIsMobileOpen(false)}>
                    Apply Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
