import type { Program, ProgramModule } from "@/types";

export const MODULE_SCHEDULE = {
  daysPerWeek: 3,
  hoursPerDay: 1.5,
} as const;

function module(
  name: string,
  subtitle: string,
  duration: string,
  schedule: { daysPerWeek: number; hoursPerDay: number } = MODULE_SCHEDULE
): ProgramModule {
  return {
    name,
    subtitle,
    duration,
    daysPerWeek: schedule.daysPerWeek,
    hoursPerDay: schedule.hoursPerDay,
  };
}

export const programs: Program[] = [
  {
    id: "web-dev",
    slug: "web-development",
    title: "Web Development",
    category: "active",
    description:
      "Go from zero to full-stack developer — HTML, CSS, JavaScript, React, and backend with Node.js, Express, and MongoDB.",
    duration: "~3.5 months · 4 modules",
    level: "Beginner to Advanced",
    outcomes: [
      "Build responsive, modern websites from scratch",
      "Write JavaScript and React for fast, interactive UIs",
      "Create APIs and databases with Node.js and MongoDB",
      "Ship full-stack projects for your portfolio",
    ],
    modules: [
      module(
        "HTML & CSS",
        "For very beginners learning web for the first time",
        "1 month"
      ),
      module(
        "JavaScript",
        "For those who want to learn a programming language easily",
        "3 weeks"
      ),
      module(
        "React",
        "To build websites with fast, modern UI",
        "3 weeks"
      ),
      module(
        "Backend + Database",
        "Node.js, Express, and MongoDB for full-stack apps",
        "1 month"
      ),
    ],
  },
  {
    id: "app-dev",
    slug: "app-development",
    title: "Flutter App Development",
    category: "active",
    description:
      "Learn Dart, Flutter UI, and Firebase to build and publish cross-platform mobile apps for Android and iOS.",
    duration: "9 weeks · 3 modules",
    level: "Beginner to Intermediate",
    outcomes: [
      "Master Dart and object-oriented programming",
      "Design beautiful Flutter mobile interfaces",
      "Connect apps to Firebase and REST APIs",
      "Publish apps to the Play Store and App Store",
    ],
    modules: [
      module("Dart & OOP", "Programming foundations for mobile development", "3 weeks"),
      module("Flutter Frontend", "Widgets, layouts, and polished mobile UI", "3 weeks"),
      module("Firebase & APIs", "Authentication, cloud data, and backend integration", "3 weeks"),
    ],
  },
  {
    id: "ai",
    slug: "artificial-intelligence",
    title: "Artificial Intelligence",
    category: "future",
    description:
      "Explore machine learning, deep learning, and AI application development for real-world business solutions.",
    duration: "Coming Soon",
    level: "Intermediate",
    outcomes: [
      "Understand ML fundamentals and algorithms",
      "Build and train neural networks",
      "Deploy AI models to production",
      "Apply AI to solve business problems",
    ],
    modules: [],
  },
  {
    id: "video-editing",
    slug: "video-editing",
    title: "Video Editing",
    category: "future",
    description:
      "Learn professional video editing, motion graphics, and content creation for social media, YouTube, and digital campaigns.",
    duration: "Coming Soon",
    level: "Beginner to Intermediate",
    outcomes: [
      "Edit videos with professional tools",
      "Apply transitions, effects, and color grading",
      "Create engaging social media content",
      "Produce polished videos for clients and brands",
    ],
    modules: [],
  },
  {
    id: "digital-marketing",
    slug: "digital-marketing",
    title: "Digital Marketing",
    category: "future",
    description:
      "Master SEO, content strategy, social media, and analytics to drive measurable business growth.",
    duration: "Coming Soon",
    level: "Beginner",
    outcomes: [
      "Develop data-driven marketing strategies",
      "Execute SEO and content campaigns",
      "Manage paid advertising channels",
      "Analyze and optimize conversion funnels",
    ],
    modules: [],
  },
  {
    id: "graphics-designing",
    slug: "graphics-designing",
    title: "Graphics Designing",
    category: "future",
    description:
      "Build strong visual design skills for branding, social media, print, and digital marketing creatives.",
    duration: "Coming Soon",
    level: "Beginner to Intermediate",
    outcomes: [
      "Create logos, posters, and brand assets",
      "Design social media and marketing graphics",
      "Use industry-standard design tools",
      "Develop a professional design portfolio",
    ],
    modules: [],
  },
  {
    id: "ui-ux",
    slug: "ui-ux-design",
    title: "UI/UX Designing",
    category: "future",
    description:
      "Learn user-centered design principles, prototyping, and design systems for digital products.",
    duration: "Coming Soon",
    level: "Beginner to Intermediate",
    outcomes: [
      "Conduct user research and usability testing",
      "Create wireframes and high-fidelity prototypes",
      "Build cohesive design systems",
      "Collaborate effectively with developers",
    ],
    modules: [],
  },
];

export function getProgramBySlug(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}

export function formatModuleSchedule(mod: ProgramModule) {
  return `${mod.daysPerWeek} days/week · ${mod.hoursPerDay} hr/class`;
}
