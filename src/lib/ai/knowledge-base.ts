import "server-only";

export interface KnowledgeSnippet {
  id: string;
  category: "academy" | "programs" | "modules" | "schedules" | "portal" | "admissions" | "policies";
  title: string;
  content: string;
  keywords: string[];
  link?: string;
}

export const EEST_KNOWLEDGE_BASE: KnowledgeSnippet[] = [
  {
    id: "about-eest",
    category: "academy",
    title: "About Emerging Edge School of Technology (EEST)",
    content:
      "Emerging Edge School of Technology (EEST) is a modern technology academy providing modular, industry-focused tech education. Location: University Road, Hayatabad, Peshawar, Khyber Pakhtunkhwa, Pakistan. Official website: https://school.emergingedge.tech. Official email: eeschooltech@gmail.com.",
    keywords: ["eest", "emerging edge", "about", "what is eest", "location", "address", "peshawar", "hayatabad", "school"],
    link: "https://school.emergingedge.tech",
  },
  {
    id: "learning-model",
    category: "academy",
    title: "Level-by-Level Modular Learning Model",
    content:
      "EEST operates on a registration-based modular learning system. Students enroll level by level (Foundations -> Intermediate -> Advanced). After completing assessments for one level, they register for the next level. This guarantees true mastery before advancement. Every module completed earns a verifiable digital certificate.",
    keywords: ["model", "level by level", "modular", "how it works", "pace", "assessment", "progression"],
    link: "https://school.emergingedge.tech/admissions",
  },
  {
    id: "program-web-development",
    category: "programs",
    title: "Full Stack Web Development Program",
    content:
      "Web Development is an 8+ week comprehensive roadmap. Curriculum breakdown:\n- Module 1: Web Foundations (HTML5 semantic tags, CSS3, Flexbox, CSS Grid, Responsive Design, Git/GitHub).\n- Module 2: Modern JavaScript (ES6+, DOM Manipulation, Async/Await, Fetch API, LocalStorage, Clean Code).\n- Module 3: React & Modern Frontend (Components, Hooks, State Management, TailwindCSS, Next.js App Router).\n- Module 4: Full Stack & Backend (Node.js, Express, MongoDB Atlas, Prisma ORM, REST APIs, NextAuth Authentication).\nLive classes for Web Dev are held Mon, Tue, and Wed at 10:00 PM (PKT).",
    keywords: ["web", "web development", "html", "css", "javascript", "react", "next.js", "node", "mongodb", "mern", "frontend", "backend"],
    link: "https://school.emergingedge.tech/programs/web-development",
  },
  {
    id: "program-app-development",
    category: "programs",
    title: "Mobile App Development Program (Flutter & Dart)",
    content:
      "Mobile App Development trains students to build production iOS & Android apps.\n- Module 1: Dart & Object-Oriented Programming (OOP).\n- Module 2: Flutter Frontend & UI Design.\n- Module 3: Firebase Integration & REST APIs.\nLive classes are held Friday, Saturday, and Sunday at 8:00 PM (PKT).",
    keywords: ["app", "app development", "flutter", "dart", "mobile", "ios", "android", "firebase"],
    link: "https://school.emergingedge.tech/programs/app-development",
  },
  {
    id: "program-ai",
    category: "programs",
    title: "Applied Artificial Intelligence & Machine Learning",
    content:
      "Artificial Intelligence program focuses on real-world engineering:\n- Module 1: AI Launchpad & Applied Python Fundamentals.\n- Module 2: Data Science to Machine Learning Engineer.\n- Module 3: Generative AI, LLM APIs (Gemini/OpenAI), and Autonomous Agents.\nLive classes are held Friday, Saturday, and Sunday from 10:00 PM to 11:30 PM (PKT).",
    keywords: ["ai", "artificial intelligence", "python", "machine learning", "llm", "genai", "agents", "langchain"],
    link: "https://school.emergingedge.tech/programs/artificial-intelligence",
  },
  {
    id: "program-digital-marketing",
    category: "programs",
    title: "Digital Marketing with AI",
    content:
      "Comprehensive digital marketing curriculum covering Social Media Marketing (SMM), Content Strategy, Search Engine Optimization (SEO Audits & Keyword Research), and Client Pitching with AI tools.\nLive classes are held Monday, Tuesday, and Wednesday from 9:00 PM to 10:00 PM (PKT).",
    keywords: ["marketing", "digital marketing", "seo", "social media", "smm", "content", "ads"],
    link: "https://school.emergingedge.tech/programs/digital-marketing",
  },
  {
    id: "other-programs",
    category: "programs",
    title: "Design & Creative Programs",
    content:
      "EEST also offers courses in Video Editing (Commercial editing in Premiere Pro & After Effects), Graphics Designing (Visual branding, Adobe Photoshop & Illustrator), and UI/UX Designing (Wireframing, prototyping, Figma design systems).",
    keywords: ["video editing", "graphic design", "graphics", "ui", "ux", "figma", "photoshop", "premiere"],
    link: "https://school.emergingedge.tech/programs",
  },
  {
    id: "admissions-eligibility",
    category: "admissions",
    title: "Admissions & Eligibility Criteria",
    content:
      "Anyone can join EEST! There are no strict degree requirements. Beginners with zero coding experience are welcome. Requirements: A computer/laptop or smartphone, reliable internet access, and dedication of 1–2 hours daily. Admissions can be submitted online at https://school.emergingedge.tech/register.",
    keywords: ["admission", "eligibility", "requirements", "prerequisites", "how to join", "apply", "register", "beginner"],
    link: "https://school.emergingedge.tech/admissions",
  },
  {
    id: "portal-recordings",
    category: "portal",
    title: "Class Recordings & Google Drive Access",
    content:
      "All lecture recordings are uploaded to the student portal under 'Class Recordings' (/student/recordings). Recordings are hosted securely via Google Drive with direct playback links, notes, and topic summaries. Students only have access to recordings of their enrolled modules.",
    keywords: ["recording", "recordings", "drive", "missed class", "lecture", "video", "watch again", "google drive"],
    link: "https://school.emergingedge.tech/student/recordings",
  },
  {
    id: "portal-live-classes",
    category: "portal",
    title: "Joining Live Classes",
    content:
      "Live classes are conducted online via Google Meet or in-portal video rooms. To join, go to 'Live Classes' (/student/classes) on your student dashboard. The join link appears 15–30 minutes before class starts. Clicking 'Join Class' automatically records your attendance in the portal.",
    keywords: ["class", "live class", "meet", "google meet", "link", "join", "online class", "timing", "schedule"],
    link: "https://school.emergingedge.tech/student/classes",
  },
  {
    id: "portal-assignments",
    category: "portal",
    title: "Assignments & Homework Submissions",
    content:
      "Assignments and practice tasks are listed under 'Assignments' (/student/assignments). Students submit live website links (Vercel/Netlify), GitHub repository links, or written answers. Trainers review submissions, assign marks, and provide constructive feedback.",
    keywords: ["assignment", "assignments", "homework", "task", "submit", "github", "deadline", "marks", "feedback"],
    link: "https://school.emergingedge.tech/student/assignments",
  },
  {
    id: "portal-certificates",
    category: "portal",
    title: "Certificates & Verification",
    content:
      "Upon successful completion of each module and required assignments, a verifiable digital certificate is issued under 'Certificates' (/student/certificates). Each certificate contains a unique cryptographic verification code that can be verified publicly by employers at https://school.emergingedge.tech/verify.",
    keywords: ["certificate", "certificates", "certification", "verify", "credential", "download certificate", "completion"],
    link: "https://school.emergingedge.tech/verify",
  },
  {
    id: "portal-support-tickets",
    category: "portal",
    title: "Student Support & Helpdesk",
    content:
      "Students facing technical difficulties, portal issues, or attendance disputes can submit a support ticket at /student/support. Our support team responds within 24–48 hours. Urgent inquiries can also be directed to the official student WhatsApp group or admin contact.",
    keywords: ["support", "help", "ticket", "issue", "problem", "portal problem", "helpdesk", "contact support"],
    link: "https://school.emergingedge.tech/student/support",
  },
  {
    id: "policies-strict-rules",
    category: "policies",
    title: "Official Academy Policies",
    content:
      "- Single Device Login: For security and fair use, student portal accounts are restricted to one active session at a time.\n- Strict Module Isolation: Students only access materials, recordings, and classes for modules they are explicitly registered and approved for.\n- Integrity & Plagiarism: Code submissions must be the student's own work.\n- Fees: Specific fee details or payment queries should always be checked via official admissions (/admissions) or WhatsApp.",
    keywords: ["policy", "rules", "single device", "fee", "cost", "plagiarism", "isolation"],
    link: "https://school.emergingedge.tech/terms",
  },
  {
    id: "fees-payment-verification",
    category: "admissions",
    title: "100% Free Tuition & Registration Fee",
    content:
      "Tuition across all bootcamps is 100% FREE! EEST only charges a one-time minimal registration/admission fee of PKR 1,000 to cover portal operations, cloud hosting, and certificate verification. Payment can be made via Easypaisa, JazzCash, or Bank Transfer. After uploading the payment screenshot during registration at /register, admin approval takes 24–48 hours.",
    keywords: ["fee", "fees", "cost", "free", "price", "pkr 1000", "tuition", "payment", "easypaisa", "jazzcash", "bank transfer", "screenshot", "verification"],
    link: "https://school.emergingedge.tech/register",
  },
  {
    id: "attendance-and-recordings-policy",
    category: "portal",
    title: "Attendance & Missed Classes Policy",
    content:
      "Attendance is automatically recorded whenever a student clicks 'Join Class' in the student portal (/student/classes). Students must maintain at least 75% attendance to qualify for the final certificate. If you miss a live class due to an emergency or power outage, full lecture recordings with session notes are uploaded to /student/recordings on Google Drive within 24 hours.",
    keywords: ["attendance", "absent", "missed class", "late", "percentage", "75%", "attendance requirement", "recordings"],
    link: "https://school.emergingedge.tech/student/attendance",
  },
  {
    id: "module-progression-switching",
    category: "modules",
    title: "Level Progression & Module Switching",
    content:
      "EEST follows a level-by-level journey (Foundations -> Intermediate -> Advanced). Students enroll and complete one module at a time. To proceed to the next module or switch active modules, visit /student/modules in your student portal. Once your trainer approves your previous assignments, your new module becomes active with updated classes, recordings, and assignments.",
    keywords: ["module", "switch module", "next module", "level", "progression", "module 2", "module 3", "upgrade", "advance"],
    link: "https://school.emergingedge.tech/student/modules",
  },
  {
    id: "assignments-and-grading",
    category: "portal",
    title: "Assignment Submission & Feedback Guidelines",
    content:
      "All homework and practical tasks are found under /student/assignments. For coding assignments, submit your GitHub repository link along with a live deployed URL (e.g., Vercel, Netlify, or GitHub Pages). For design or video tasks, submit shareable Google Drive links. Trainers review each submission and post scores with written feedback directly in the portal within 3–5 days.",
    keywords: ["assignment", "grading", "marks", "github link", "vercel link", "submission", "score", "feedback", "homework"],
    link: "https://school.emergingedge.tech/student/assignments",
  },
  {
    id: "contact-community-whatsapp",
    category: "academy",
    title: "Official Community & Contact Channels",
    content:
      "Official Contact:\n- Website: https://school.emergingedge.tech\n- Email: eeschooltech@gmail.com\n- Campus: University Road, Hayatabad, Peshawar, Khyber Pakhtunkhwa, Pakistan\n- Student Community: Registered students receive access to official WhatsApp announcement groups and support channels upon admission approval. For technical disputes, open a ticket at /student/support.",
    keywords: ["contact", "whatsapp", "email", "phone", "community", "group", "campus", "location", "address", "support"],
    link: "https://school.emergingedge.tech/contact",
  },
];

/**
 * Deterministic keyword-based retriever that selects up to 3 most relevant passages.
 */
export function getRelevantKnowledge(query: string, maxResults = 4): KnowledgeSnippet[] {
  const normalized = query.toLowerCase().replace(/[^\w\s]/g, " ");
  const queryTokens = normalized.split(/\s+/).filter((t) => t.length > 2);

  if (queryTokens.length === 0) {
    return EEST_KNOWLEDGE_BASE.slice(0, maxResults);
  }

  const scored = EEST_KNOWLEDGE_BASE.map((snippet) => {
    let score = 0;

    for (const token of queryTokens) {
      // Keyword match
      for (const kw of snippet.keywords) {
        if (kw === token) score += 5;
        else if (kw.includes(token) || token.includes(kw)) score += 2;
      }
      // Title match
      if (snippet.title.toLowerCase().includes(token)) score += 3;
      // Content match
      if (snippet.content.toLowerCase().includes(token)) score += 1;
    }

    return { snippet, score };
  });

  const filtered = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.snippet);

  // If no specific match, return general academy & portal facts
  if (filtered.length === 0) {
    return EEST_KNOWLEDGE_BASE.filter(
      (s) => s.id === "about-eest" || s.id === "learning-model" || s.id === "portal-support-tickets"
    );
  }

  return filtered.slice(0, maxResults);
}
