export const PROGRAM_ACCENTS: Record<
  string,
  { gradient: string; glow: string; iconBg: string }
> = {
  "web-development": {
    gradient: "from-slate-700 via-slate-800 to-slate-950",
    glow: "group-hover:shadow-slate-900/20",
    iconBg: "bg-slate-900/10 text-slate-700",
  },
  "app-development": {
    gradient: "from-indigo-600 via-violet-700 to-indigo-950",
    glow: "group-hover:shadow-indigo-600/20",
    iconBg: "bg-indigo-500/10 text-indigo-600",
  },
  "graphics-designing": {
    gradient: "from-rose-500 via-pink-600 to-rose-900",
    glow: "group-hover:shadow-rose-500/20",
    iconBg: "bg-rose-500/10 text-rose-600",
  },
  "digital-marketing": {
    gradient: "from-emerald-500 via-teal-600 to-emerald-900",
    glow: "group-hover:shadow-emerald-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  "video-editing": {
    gradient: "from-amber-500 via-orange-600 to-amber-900",
    glow: "group-hover:shadow-amber-500/20",
    iconBg: "bg-amber-500/10 text-amber-600",
  },
  "artificial-intelligence": {
    gradient: "from-violet-600 via-purple-700 to-violet-950",
    glow: "group-hover:shadow-violet-600/20",
    iconBg: "bg-violet-500/10 text-violet-600",
  },
  "ui-ux-design": {
    gradient: "from-cyan-500 via-sky-600 to-cyan-900",
    glow: "group-hover:shadow-cyan-500/20",
    iconBg: "bg-cyan-500/10 text-cyan-600",
  },
};

export const DEFAULT_PROGRAM_ACCENT = {
  gradient: "from-orange-500 via-orange-600 to-orange-900",
  glow: "group-hover:shadow-primary/20",
  iconBg: "bg-primary/10 text-primary",
};

export function getProgramAccent(slug: string) {
  return PROGRAM_ACCENTS[slug] ?? DEFAULT_PROGRAM_ACCENT;
}
