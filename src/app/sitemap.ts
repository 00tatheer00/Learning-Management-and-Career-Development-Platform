import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { programs } from "@/lib/data/programs";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;

  const staticPages = [
    "",
    "/about",
    "/programs",
    "/trainers",
    "/admissions",
    "/register",
    "/student-portal",
    "/blog",
    "/events",
    "/contact",
    "/privacy",
    "/terms",
  ];

  const programPages = programs.map((program) => ({
    url: `${baseUrl}/programs/${program.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticSitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === "" ? ("daily" as const) : ("weekly" as const),
    priority: page === "" ? 1 : 0.7,
  }));

  return [...staticSitemap, ...programPages];
}
