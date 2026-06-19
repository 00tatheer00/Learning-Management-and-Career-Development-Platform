import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { LayoutSwitcher } from "@/components/layout/layout-switcher";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { OrganizationSchema } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

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
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthSessionProvider>
          <LayoutSwitcher>{children}</LayoutSwitcher>
          <ToastProvider />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
