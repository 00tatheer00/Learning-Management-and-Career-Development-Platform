"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NavigationProgress } from "@/components/providers/navigation-progress";

const PORTAL_PREFIXES = ["/student", "/trainer", "/admin", "/login"];

export function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`)
  );

  return (
    <>
      <NavigationProgress />
      {isPortal ? (
        children
      ) : (
        <>
          <Navbar />
          <main id="main-content" className="relative z-0">
            {children}
          </main>
          <Footer />
        </>
      )}
    </>
  );
}
