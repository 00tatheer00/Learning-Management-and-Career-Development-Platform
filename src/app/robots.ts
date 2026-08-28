import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/student/",
          "/trainer/",
          "/auth/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/student/",
          "/trainer/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
