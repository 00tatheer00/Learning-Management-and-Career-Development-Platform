import type { Metadata } from "next";
import { Inter, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { LayoutSwitcher } from "@/components/layout/layout-switcher";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { HelpWhatsApp } from "@/components/shared/student-help";
import { OrganizationSchema } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { PORTAL_THEME_STORAGE_KEY } from "@/lib/constants/portal-theme";
import "./globals.css";
import "./student-portal-theme.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-portal",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = createMetadata({
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  path: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("${PORTAL_THEME_STORAGE_KEY}");if(t==="dark")document.documentElement.dataset.portalThemeInit="dark"}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} ${plusJakarta.variable} antialiased bg-background text-foreground`}
      >
        <AuthSessionProvider>
          <LayoutSwitcher>{children}</LayoutSwitcher>
          <HelpWhatsApp />
          <ToastProvider />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
