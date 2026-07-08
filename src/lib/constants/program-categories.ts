import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

export type EnrollableProgramSlug = (typeof ENROLLABLE_PROGRAM_SLUGS)[number];

export const PREMIUM_HEADER_GRADIENT_FALLBACK = "from-[#1a365d] to-[#0b1b33]";

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
    badgeClass: "bg-blue-50 text-[#1a365d] border-blue-100",
    headerGradient: "from-[#1e4068] to-[#0b1b33]",
  },
  "app-development": {
    slug: "app-development",
    title: "Flutter App Development",
    shortLabel: "App",
    sidebarLabel: "App Development",
    primaryTrainerSeedId: "trainer-talha",
    badgeClass: "bg-indigo-50 text-indigo-900 border-indigo-100",
    headerGradient: "from-[#1e3358] to-[#0e1830]",
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
