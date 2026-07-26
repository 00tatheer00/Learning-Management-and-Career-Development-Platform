import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

interface PageSEO {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  manifest?: string;
}

export function createMetadata({
  title,
  description = SITE_CONFIG.description,
  path = "",
  image = "/eest-logo.png",
  noIndex = false,
  manifest,
}: PageSEO): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;
  const fullTitle = title === SITE_CONFIG.name ? title : `${title} | ${SITE_CONFIG.name}`;
  const imageUrl = image.startsWith("http")
    ? image
    : `${SITE_CONFIG.url}${image.startsWith("/") ? "" : "/"}${image}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: url,
    },
    ...(manifest ? { manifest } : {}),
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: "@emergingedge",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    icons: {
      icon: "/eest-logo.png",
      apple: "/eest-logo.png",
    },
  };
}
