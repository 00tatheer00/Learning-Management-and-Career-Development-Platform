import type { Trainer } from "@/types";

const PROGRAM_EXPERTISE: Record<string, string> = {
  "web-development": "Expert in MERN Stack",
  "app-development": "Expert in Flutter & Firebase",
  "graphics-designing": "Expert in Visual Design",
  "digital-marketing": "Expert in Digital Growth",
  "video-editing": "Expert in Video Production",
  "artificial-intelligence": "Expert in AI & ML",
  "ui-ux-design": "Expert in Product Design",
};

const PROGRAM_HEADLINE: Record<string, string> = {
  "web-development": "SOFTWARE DEVELOPER",
  "app-development": "APP DEVELOPER",
  "graphics-designing": "GRAPHIC DESIGNER",
  "digital-marketing": "DIGITAL MARKETER",
  "video-editing": "VIDEO EDITOR",
  "artificial-intelligence": "AI SPECIALIST",
  "ui-ux-design": "UI/UX DESIGNER",
};

const PROGRAM_SHOWCASE: Record<string, string[]> = {
  "web-development": ["MongoDB", "React", "Node.js"],
  "app-development": ["Flutter", "Firebase", "Dart"],
  "graphics-designing": ["Photoshop", "Illustrator", "Branding"],
  "digital-marketing": ["SEO", "Social", "Analytics"],
  "video-editing": ["Premiere", "After Effects", "Motion"],
  "artificial-intelligence": ["Python", "ML", "AI Tools"],
  "ui-ux-design": ["Figma", "Research", "Prototyping"],
};

export function getTrainerRoleBadge(trainer: Trainer): string {
  return trainer.designation.toUpperCase();
}

export function getTrainerHeadline(trainer: Trainer): string {
  if (trainer.headlineTitle) return trainer.headlineTitle;
  if (trainer.programSlug && PROGRAM_HEADLINE[trainer.programSlug]) {
    return PROGRAM_HEADLINE[trainer.programSlug];
  }
  return trainer.designation.toUpperCase();
}

export function getTrainerExpertiseHighlight(trainer: Trainer): string {
  if (trainer.expertiseHighlight) return trainer.expertiseHighlight;
  if (trainer.programSlug && PROGRAM_EXPERTISE[trainer.programSlug]) {
    return PROGRAM_EXPERTISE[trainer.programSlug];
  }
  const primary = trainer.expertise[0];
  return primary ? `Expert in ${primary}` : "Expert Mentor";
}

export function getTrainerStudentsTrained(trainer: Trainer): string {
  return trainer.studentsTrained ?? "1000+ Students Trained";
}

export function getTrainerExperienceLabel(trainer: Trainer): string {
  const value = trainer.experience?.trim() || "3+ years";
  return value.toLowerCase().includes("experience") ? value : `${value} of Experience`;
}

export function getTrainerShowcaseSkills(trainer: Trainer): string[] {
  if (trainer.showcaseSkills?.length) return trainer.showcaseSkills.slice(0, 4);
  if (trainer.programSlug && PROGRAM_SHOWCASE[trainer.programSlug]) {
    return PROGRAM_SHOWCASE[trainer.programSlug];
  }
  return trainer.expertise.slice(0, 3);
}

export const SKILL_ICON_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  MongoDB: { bg: "bg-emerald-600", text: "text-white", label: "M" },
  React: { bg: "bg-sky-500", text: "text-white", label: "R" },
  "Node.js": { bg: "bg-green-600", text: "text-white", label: "N" },
  Flutter: { bg: "bg-sky-400", text: "text-white", label: "F" },
  Firebase: { bg: "bg-amber-500", text: "text-white", label: "Fb" },
  Dart: { bg: "bg-blue-600", text: "text-white", label: "D" },
  Photoshop: { bg: "bg-indigo-700", text: "text-white", label: "Ps" },
  Illustrator: { bg: "bg-orange-600", text: "text-white", label: "Ai" },
  Branding: { bg: "bg-rose-500", text: "text-white", label: "B" },
  SEO: { bg: "bg-teal-600", text: "text-white", label: "S" },
  Social: { bg: "bg-pink-500", text: "text-white", label: "So" },
  Analytics: { bg: "bg-violet-600", text: "text-white", label: "A" },
  Premiere: { bg: "bg-purple-700", text: "text-white", label: "Pr" },
  "After Effects": { bg: "bg-indigo-800", text: "text-white", label: "Ae" },
  Motion: { bg: "bg-fuchsia-600", text: "text-white", label: "Mo" },
  Python: { bg: "bg-yellow-500", text: "text-slate-900", label: "Py" },
  ML: { bg: "bg-cyan-600", text: "text-white", label: "ML" },
  "AI Tools": { bg: "bg-violet-700", text: "text-white", label: "AI" },
  Figma: { bg: "bg-orange-500", text: "text-white", label: "Fg" },
  Research: { bg: "bg-slate-600", text: "text-white", label: "Rs" },
  Prototyping: { bg: "bg-blue-500", text: "text-white", label: "Pt" },
};

export function getSkillIconStyle(skill: string) {
  return (
    SKILL_ICON_STYLES[skill] ?? {
      bg: "bg-primary",
      text: "text-white",
      label: skill.slice(0, 2),
    }
  );
}
