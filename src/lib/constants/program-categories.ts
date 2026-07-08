import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

export type EnrollableProgramSlug = (typeof ENROLLABLE_PROGRAM_SLUGS)[number];

export const PREMIUM_HEADER_GRADIENT_FALLBACK = "from-[#1a4d8f] to-[#1e90ff]";

export const PROGRAM_CATEGORIES: Record<
  EnrollableProgramSlug,
  {
    slug: EnrollableProgramSlug;
    title: string;
    shortLabel: string;
    sidebarLabel: string;
    primaryTrainerSeedId: string;
    badgeClass: string;
    headerGradient: string;
  }
> = {
  "web-development": {
    slug: "web-development",
    title: "Web Development",
    shortLabel: "Web",
    sidebarLabel: "Web Development",
    primaryTrainerSeedId: "trainer-tatheer",
    badgeClass: "bg-primary/10 text-[#1873cc] border-primary/25",
    headerGradient: "from-[#1a4d8f] to-[#1e90ff]",
  },
  "app-development": {
    slug: "app-development",
    title: "Flutter App Development",
    shortLabel: "App",
    sidebarLabel: "App Development",
    primaryTrainerSeedId: "trainer-talha",
    badgeClass: "bg-primary/10 text-[#1873cc] border-primary/25",
    headerGradient: "from-[#1a4d8f] to-[#1e90ff]",
  },
};

export function isEnrollableProgramSlug(slug: string): slug is EnrollableProgramSlug {
  return ENROLLABLE_PROGRAM_SLUGS.includes(slug as EnrollableProgramSlug);
}

export function getProgramCategory(slug: string) {
  if (isEnrollableProgramSlug(slug)) {
    return PROGRAM_CATEGORIES[slug];
  }
  return null;
}
