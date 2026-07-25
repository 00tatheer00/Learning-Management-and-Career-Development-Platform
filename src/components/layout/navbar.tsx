"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { List, X, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/shared/site-logo";
import { NAV_LINKS, REGISTRATION_OPEN } from "@/lib/constants";
import { isNavLinkActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

function useLocationHash(pathname: string) {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  return hash;
}

export function Navbar() {
  const pathname = usePathname();
  const hash = useLocationHash(pathname);
  const navHrefs = NAV_LINKS.map((link) => link.href);
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
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-2 sm:p-4"
    >
      <nav
        className={cn(
          "max-w-7xl mx-auto flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 rounded-2xl sm:rounded-full pointer-events-auto transition-all duration-300",
          isScrolled
            ? "bg-slate-900/85 dark:bg-slate-950/85 backdrop-blur-xl border border-orange-500/20 shadow-2xl shadow-orange-500/10 text-white"
            : "bg-slate-900/60 dark:bg-slate-950/60 backdrop-blur-md border border-white/10 text-white shadow-lg"
        )}
        aria-label="Main navigation"
      >
        <SiteLogo variant="navbar" priority className="relative z-10 scale-95 sm:scale-100" />

        {/* Desktop Links with Animated Active Indicator */}
        <div className="hidden lg:flex items-center gap-1 relative z-10 bg-slate-950/40 p-1.5 rounded-full border border-white/5">
          {NAV_LINKS.map((link) => {
            const active = isNavLinkActive(pathname, hash, link.href, navHrefs);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className={cn(
                  "relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 z-10",
                  active ? "text-white font-extrabold" : "text-slate-300 hover:text-white"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-md shadow-orange-500/30 -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-2.5 relative z-10">
          <Button variant="ghost" size="sm" className="text-xs text-slate-200 hover:text-white hover:bg-white/10 rounded-full h-9 px-4" asChild>
            <Link href="/student-portal" prefetch>
              Student Portal
            </Link>
          </Button>
          {REGISTRATION_OPEN ? (
            <Button size="sm" className="text-xs font-bold uppercase tracking-wider rounded-full h-9 px-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 hover:scale-105 transition-all" asChild>
              <Link href="/register" prefetch className="flex items-center gap-1.5">
                <span>Apply Now</span>
                <ArrowRight size={13} className="stroke-[3]" />
              </Link>
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled className="opacity-70 cursor-not-allowed text-xs rounded-full h-9">
              Admissions Closed
            </Button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors relative z-10"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
        </button>
      </nav>

      {/* Animated Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40 pointer-events-auto"
              aria-label="Close menu overlay"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-7xl mx-auto mt-2 lg:hidden bg-slate-900/95 border border-orange-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl relative z-50 pointer-events-auto text-white overflow-hidden"
            >
              <div className="flex flex-col gap-1.5">
                {NAV_LINKS.map((link) => {
                  const active = isNavLinkActive(pathname, hash, link.href, navHrefs);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch
                      className={cn(
                        "px-4 py-2.5 text-sm font-medium rounded-xl transition-all",
                        active
                          ? "text-white font-bold bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="flex flex-col gap-2.5 mt-3 pt-3 border-t border-white/10">
                  <Button variant="outline" className="border-white/15 text-white hover:bg-white/10 rounded-xl" asChild>
                    <Link href="/student-portal" prefetch onClick={() => setIsMobileOpen(false)}>
                      Student Portal Login
                    </Link>
                  </Button>
                  {REGISTRATION_OPEN ? (
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold uppercase text-xs rounded-xl shadow-lg shadow-orange-500/30" asChild>
                      <Link href="/register" prefetch onClick={() => setIsMobileOpen(false)}>
                        Apply Now
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled className="opacity-70 cursor-not-allowed w-full rounded-xl">
                      Admissions Closed
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

