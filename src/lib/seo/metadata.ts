import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const DEFAULT_KEYWORDS = [
  "Emerging Edge School of Technology",
  "EEST",
  "Web Development Courses",
  "Full Stack Web Development",
  "Next.js Training",
  "React JS Bootcamp",
  "App Development Courses",
  "Flutter App Development",
  "Artificial Intelligence Course",
  "AI & Machine Learning Training",
  "Python Programming",
  "Video Editing Masterclass",
  "Premiere Pro & After Effects",
  "Digital Marketing Certification",
  "SEO & Performance Marketing",
  "Graphics Designing Course",
  "UI UX Designing Figma",
  "Online IT Courses in Pakistan",
  "Verified Student Certificates",
  "Tech Career Development",
  "Summer Training Bootcamps",
];

export interface PageSEO {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[] | string;
  noIndex?: boolean;
  manifest?: string;
  type?: "website" | "article" | "profile";
}

export function createMetadata({
  title,
  description = SITE_CONFIG.description,
  path = "",
  image = "/eest-logo.png",
  keywords,
  noIndex = false,
  manifest,
  type = "website",
}: PageSEO): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;
  
  // Ensure title is optimally sized (50-60 characters)
  let fullTitle: string;
  if (!title || title === SITE_CONFIG.name || title === SITE_CONFIG.defaultTitle) {
    fullTitle = SITE_CONFIG.defaultTitle;
  } else if (title.includes(SITE_CONFIG.name) || title.includes(SITE_CONFIG.shortName)) {
    fullTitle = title;
  } else {
    fullTitle = `${title} | ${SITE_CONFIG.name}`;
  }

  const imageUrl = image.startsWith("http")
    ? image
    : `${SITE_CONFIG.url}${image.startsWith("/") ? "" : "/"}${image}`;

  const resolvedKeywords = keywords
    ? Array.isArray(keywords)
      ? [...keywords, ...DEFAULT_KEYWORDS]
      : [keywords, ...DEFAULT_KEYWORDS]
    : DEFAULT_KEYWORDS;

  return {
    title: fullTitle,
    description,
    keywords: resolvedKeywords,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: url,
      languages: {
        "x-default": url,
        en: url,
        "en-US": url,
        "en-PK": url,
      },
    },
    authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    formatDetection: {
      email: true,
      address: true,
      telephone: true,
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
          alt: `${fullTitle} - Emerging Edge School of Technology`,
          type: "image/png",
        },
      ],
      locale: "en_US",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: "@emergingedge",
      site: "@emergingedge",
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    icons: {
      icon: [
        { url: "/eest-logo.png", sizes: "32x32", type: "image/png" },
        { url: "/eest-logo.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [
        { url: "/eest-logo.png", sizes: "180x180", type: "image/png" },
      ],
    },
    category: "Education & Technology",
  };
}
