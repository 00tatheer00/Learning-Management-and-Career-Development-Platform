import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { LayoutSwitcher } from "@/components/layout/layout-switcher";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { OrganizationSchema, WebSiteSchema, IdentitySchema, LocalBusinessSchema } from "@/components/seo/json-ld";
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
  title: SITE_CONFIG.defaultTitle,
  description: SITE_CONFIG.description,
  path: "/",
  manifest: "/manifest.json",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#ea580c",
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-EESTSCHOOL26";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <OrganizationSchema />
        <WebSiteSchema />
        <IdentitySchema />
        <LocalBusinessSchema />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("${PORTAL_THEME_STORAGE_KEY}");if(t==="dark")document.documentElement.dataset.portalThemeInit="dark"}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} ${plusJakarta.variable} antialiased bg-background text-foreground`}
      >
        {/* Google Analytics / Website Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        <AuthSessionProvider>
          <LayoutSwitcher>{children}</LayoutSwitcher>
          <ToastProvider />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
