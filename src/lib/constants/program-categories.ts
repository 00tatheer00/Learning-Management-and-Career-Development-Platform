import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

export type EnrollableProgramSlug = (typeof ENROLLABLE_PROGRAM_SLUGS)[number];

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
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    headerGradient: "from-orange-500 to-amber-500",
  },
  "app-development": {
    slug: "app-development",
    title: "Flutter App Development",
    shortLabel: "App",
    sidebarLabel: "App Development",
    primaryTrainerSeedId: "trainer-talha",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
    headerGradient: "from-indigo-500 to-violet-500",
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
