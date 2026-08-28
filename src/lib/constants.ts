import {
  OFFICIAL_PHONE_DISPLAY,
} from "@/lib/constants/contact";

export const SITE_CONFIG = {
  name: "Emerging Edge School of Technology",
  defaultTitle: "Emerging Edge School of Technology | IT Courses & Bootcamps",
  shortName: "EEST",
  tagline: "Learn. Build. Lead.",
  description:
    "Learn in-demand tech skills at Emerging Edge School of Technology. Master Web Dev, AI, App Dev, Video Editing & UI/UX with expert mentorship & certificates.",
  url: "https://school.emergingedge.tech",
  logo: "/eest-logo.png",
  email: "eeschooltech@gmail.com",
  phone: OFFICIAL_PHONE_DISPLAY,
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
  { href: "/verify", label: "Verify" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
] as const;

export const REGISTRATION_OPEN = true;
