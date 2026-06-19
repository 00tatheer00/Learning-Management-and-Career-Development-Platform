import {
  OFFICIAL_PHONE_DISPLAY,
  OFFICIAL_WHATSAPP_NUMBER,
} from "@/lib/constants/contact";

export const SITE_CONFIG = {
  name: "Emerging Edge School of Technology",
  shortName: "EEST",
  tagline: "Learn. Build. Lead.",
  description:
    "Emerging Edge School of Technology provides industry-focused training in Web Development, App Development, Artificial Intelligence, Video Editing, Digital Marketing, Graphics Designing, and UI/UX Designing.",
  url: "https://school.emergingedge.tech",
  logo: "/eest-logo.png",
  email: "eeschooltech@gmail.com",
  phone: OFFICIAL_PHONE_DISPLAY,
  whatsapp: OFFICIAL_WHATSAPP_NUMBER,
  address: "Global Campus — Online & Hybrid",
  social: {
    twitter: "https://twitter.com/emergingedge",
    linkedin: "https://linkedin.com/company/emergingedge",
    instagram: "https://instagram.com/emergingedge",
    youtube: "https://youtube.com/@emergingedge",
    github: "https://github.com/emergingedge",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/programs#learning-paths", label: "Learning Paths" },
  { href: "/trainers", label: "Trainers" },
  { href: "/admissions", label: "Admissions" },
  { href: "/student-portal", label: "Student Portal" },
  { href: "/contact", label: "Contact" },
] as const;
