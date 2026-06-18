"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const PORTAL_PREFIXES = ["/student", "/trainer", "/admin", "/login"];

export function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`)
  );

  if (isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
