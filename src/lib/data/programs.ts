import type { Program, ProgramModule } from "@/types";
import { WEB_DEV_SYLLABUS } from "@/lib/data/web-dev-syllabus";
import { FLUTTER_SYLLABUS } from "@/lib/data/flutter-syllabus";
import { AI_SYLLABUS } from "@/lib/data/ai-syllabus";
import { DIGITAL_MARKETING_SYLLABUS } from "@/lib/data/digital-marketing-syllabus";

export const MODULE_SCHEDULE = {
  daysPerWeek: 3,
  hoursPerDay: 1.5,
} as const;

function createProgramModule(
  name: string,
  subtitle: string,
  duration: string,
  schedule: { daysPerWeek: number; hoursPerDay: number } = MODULE_SCHEDULE,
  topics?: string[]
): ProgramModule {
  return {
    name,
    subtitle,
    duration,
    daysPerWeek: schedule.daysPerWeek,
    hoursPerDay: schedule.hoursPerDay,
    ...(topics && topics.length > 0 ? { topics } : {}),
  };
}

export const MARKETING_MODULE_SCHEDULE = {
  daysPerWeek: 3,
  hoursPerDay: 1,
} as const;

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
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&h=560&fit=crop&q=80",
    outcomes: [
      "Build responsive, modern websites from scratch",
      "Write JavaScript and React for fast, interactive UIs",
      "Create APIs and databases with Node.js and MongoDB",
      "Ship full-stack projects for your portfolio",
    ],
    modules: [
      createProgramModule(
        "HTML & CSS",
        "For very beginners learning web for the first time",
        "1 month",
        MODULE_SCHEDULE,
        WEB_DEV_SYLLABUS["HTML & CSS"]
      ),
      createProgramModule(
        "JavaScript",
        "For those who want to learn a programming language easily",
        "3 weeks",
        MODULE_SCHEDULE,
        WEB_DEV_SYLLABUS.JavaScript
      ),
      createProgramModule(
        "React",
        "To build websites with fast, modern UI",
        "3 weeks",
        MODULE_SCHEDULE,
        WEB_DEV_SYLLABUS.React
      ),
      createProgramModule(
        "Backend + Database",
        "Node.js, Express, and MongoDB for full-stack apps",
        "1 month",
        MODULE_SCHEDULE,
        WEB_DEV_SYLLABUS["Backend + Database"]
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
    image:
      "https://images.unsplash.com/photo-1512941937719-81f0f74b0f78?w=900&h=560&fit=crop&q=80",
    outcomes: [
      "Master Dart and object-oriented programming",
      "Design beautiful Flutter mobile interfaces",
      "Connect apps to Firebase and REST APIs",
      "Publish apps to the Play Store and App Store",
    ],
    modules: [
      createProgramModule(
        "Dart & OOP",
        "Programming foundations for mobile development",
        "3 weeks",
        MODULE_SCHEDULE,
        FLUTTER_SYLLABUS["Dart & OOP"]
      ),
      createProgramModule(
        "Flutter Frontend",
        "Widgets, layouts, and polished mobile UI",
        "3 weeks",
        MODULE_SCHEDULE,
        FLUTTER_SYLLABUS["Flutter Frontend"]
      ),
      createProgramModule(
        "Firebase & APIs",
        "Authentication, cloud data, and backend integration",
        "3 weeks",
        MODULE_SCHEDULE,
        FLUTTER_SYLLABUS["Firebase & APIs"]
      ),
    ],
  },
  {
    id: "ai",
    slug: "artificial-intelligence",
    title: "Artificial Intelligence",
    category: "active",
    description:
      "Master Python, Vibe Coding, Machine Learning, Deep Learning, RAG, and LLM Autonomous Agents with real production projects.",
    duration: "~3 months · 3 modules",
    level: "Beginner to Advanced",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&h=560&fit=crop&q=80",
    outcomes: [
      "Master Python fundamentals and trending AI vibe-coding platforms",
      "Build Data Analytics & Machine Learning pipelines from scratch",
      "Develop RAG applications using Vector DBs and Hugging Face models",
      "Architect autonomous LLM AI Agents and deploy multimodal apps",
    ],
    modules: [
      createProgramModule(
        "Module 1: AI Launchpad",
        "From Zero to Vibe-Coder — Python, AI tools, Prompt & Context Engineering",
        "1 month",
        MODULE_SCHEDULE,
        [...AI_SYLLABUS["Module 1: AI Launchpad"]]
      ),
      createProgramModule(
        "Module 2: Data to ML Engineer",
        "Analytics, Statistics, Deep Learning & MLOps Deployment",
        "1 month",
        MODULE_SCHEDULE,
        [...AI_SYLLABUS["Module 2: Data to ML Engineer"]]
      ),
      createProgramModule(
        "Module 3: Generative AI & LLM Agent Engineer",
        "RAG, Vector DBs, Multi-Model APIs, Autonomous Agents & Streamlit Apps",
        "1 month",
        MODULE_SCHEDULE,
        [...AI_SYLLABUS["Module 3: Generative AI & LLM Agent Engineer"]]
      ),
    ],
  },
  {
    id: "digital-marketing",
    slug: "digital-marketing",
    title: "Digital Marketing with AI",
    category: "active",
    description:
      "Master Social Media Marketing, SEO, Meta Ads, Client Pitching, and AI-powered marketing tools to launch your freelance career.",
    duration: "12 weeks · 3 modules",
    level: "Beginner to Advanced",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=560&fit=crop&q=80",
    outcomes: [
      "Plan & execute social media campaigns with Canva, Meta Ads & content calendars",
      "Perform full SEO audits — on-page, off-page, technical & local SEO",
      "Use AI tools (ChatGPT, Claude, Midjourney) for content, copy & reporting",
      "Build pitch decks, land freelance clients & launch your marketing career",
    ],
    modules: [
      createProgramModule(
        "Digital Marketing & Social Media",
        "Platforms, content strategy, Canva design, copywriting & Meta Ads",
        "1 month",
        MARKETING_MODULE_SCHEDULE,
        DIGITAL_MARKETING_SYLLABUS["Digital Marketing & Social Media"]
      ),
      createProgramModule(
        "SEO (Search Engine Optimization)",
        "Keyword research, on-page & off-page SEO, technical audits & reporting",
        "1 month",
        MARKETING_MODULE_SCHEDULE,
        DIGITAL_MARKETING_SYLLABUS["SEO (Search Engine Optimization)"]
      ),
      createProgramModule(
        "Client Pitching & AI in Marketing",
        "Freelancing, proposals, pitch decks, AI tools & capstone project",
        "1 month",
        MARKETING_MODULE_SCHEDULE,
        DIGITAL_MARKETING_SYLLABUS["Client Pitching & AI in Marketing"]
      ),
    ],
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
    image:
      "https://images.unsplash.com/photo-1574710160579-8ec4fc04bd1e?w=900&h=560&fit=crop&q=80",
    outcomes: [
      "Edit videos with professional tools",
      "Apply transitions, effects, and color grading",
      "Create engaging social media content",
      "Produce polished videos for clients and brands",
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
    image:
      "https://images.unsplash.com/photo-1626785774573-ac980107945f?w=900&h=560&fit=crop&q=80",
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
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=560&fit=crop&q=80",
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

export function getProgramTopicCount(program: Program): number {
  return program.modules.reduce((sum, mod) => sum + (mod.topics?.length ?? 0), 0);
}

export function programHasSyllabus(program: Program): boolean {
  return program.modules.some((mod) => (mod.topics?.length ?? 0) > 0);
}
