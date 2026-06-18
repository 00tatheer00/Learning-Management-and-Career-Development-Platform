import type { Program } from "@/types";

export const programs: Program[] = [
  {
    id: "web-dev",
    slug: "web-development",
    title: "Web Development Program",
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
    id: "flutter-dev",
    slug: "flutter-development",
    title: "Flutter Development Program",
    category: "active",
    description:
      "Create beautiful cross-platform mobile applications with Flutter and Dart, from UI design to production deployment.",
    duration: "4–14 weeks per level",
    level: "Beginner to Advanced",
    outcomes: [
      "Build cross-platform iOS and Android apps",
      "Design pixel-perfect Flutter UIs",
      "Integrate APIs and backend services",
      "Publish apps to app stores",
    ],
    levels: [
      {
        name: "Flutter Foundations",
        duration: "4 weeks",
        description: "Dart programming, widgets, and Flutter architecture",
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
    id: "ui-ux",
    slug: "ui-ux-design",
    title: "UI/UX Design",
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
    id: "cyber-security",
    slug: "cyber-security",
    title: "Cyber Security",
    category: "future",
    description:
      "Protect systems and data with ethical hacking, network security, and incident response skills.",
    duration: "Coming Soon",
    level: "Intermediate",
    outcomes: [
      "Identify and mitigate security vulnerabilities",
      "Perform penetration testing ethically",
      "Implement security best practices",
      "Respond to security incidents effectively",
    ],
    levels: [],
  },
];

export function getProgramBySlug(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}
