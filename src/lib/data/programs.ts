import type { Program } from "@/types";

export const programs: Program[] = [
  {
    id: "web-dev",
    slug: "web-development",
    title: "Web Development",
    category: "active",
    description:
      "Master modern web technologies from fundamentals to full-stack production applications with industry-standard tools and practices.",
    duration: "4–16 weeks per level",
    level: "Beginner to Advanced",
    outcomes: [
      "Build responsive, accessible websites",
      "Develop RESTful APIs and databases",
      "Deploy production-ready full-stack apps",
      "Collaborate using Git and agile workflows",
    ],
    levels: [
      {
        name: "Foundations",
        duration: "4 weeks",
        description: "HTML, CSS, JavaScript fundamentals and problem-solving",
      },
      {
        name: "Frontend Development",
        duration: "6 weeks",
        description: "React, TypeScript, state management, and modern UI patterns",
      },
      {
        name: "Backend Development",
        duration: "6 weeks",
        description: "Node.js, databases, authentication, and API design",
      },
      {
        name: "Full Stack Development",
        duration: "8 weeks",
        description: "End-to-end applications with deployment and DevOps basics",
      },
    ],
  },
  {
    id: "app-dev",
    slug: "app-development",
    title: "App Development",
    category: "active",
    description:
      "Create beautiful cross-platform mobile applications with Flutter and Dart, from UI design to production deployment.",
    duration: "4–14 weeks per level",
    level: "Beginner to Advanced",
    outcomes: [
      "Build cross-platform iOS and Android apps",
      "Design pixel-perfect mobile UIs",
      "Integrate APIs and backend services",
      "Publish apps to app stores",
    ],
    levels: [
      {
        name: "App Foundations",
        duration: "4 weeks",
        description: "Dart programming, widgets, and mobile app architecture",
      },
      {
        name: "UI Development",
        duration: "5 weeks",
        description: "Custom widgets, animations, and responsive layouts",
      },
      {
        name: "Backend Integration",
        duration: "5 weeks",
        description: "Firebase, REST APIs, state management, and authentication",
      },
      {
        name: "Production Apps",
        duration: "6 weeks",
        description: "Performance optimization, testing, and app store deployment",
      },
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
    levels: [],
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
    levels: [],
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
    levels: [],
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
    levels: [],
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
    levels: [],
  },
];

export function getProgramBySlug(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}
