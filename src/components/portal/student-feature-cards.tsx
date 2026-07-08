import Link from "next/link";
import {
  BookOpen,
  VideoCamera,
  ClipboardText,
  FilmStrip,
  ArrowRight,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

const cards = [
  {
    href: "/student/course",
    title: "My Course",
    subtitle: "Lessons & syllabus",
    icon: BookOpen,
    tint: "student-glass-card-gold",
  },
  {
    href: "/student/classes",
    title: "Live Classes",
    subtitle: "Join online sessions",
    icon: VideoCamera,
    tint: "student-glass-card-charcoal",
  },
  {
    href: "/student/assignments",
    title: "Assignments",
    subtitle: "Homework & tasks",
    icon: ClipboardText,
    tint: "student-glass-card-muted",
  },
  {
    href: "/student/recordings",
    title: "Recordings",
    subtitle: "Rewatch classes",
    icon: FilmStrip,
    tint: "student-glass-card-warm",
  },
] as const;

export function StudentFeatureCards({
  counts,
}: {
  counts: { lessons: number; classes: number; tasks: number };
}) {
  const countMap = [counts.lessons, counts.classes, counts.tasks, null] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const count = countMap[i];
        return (
          <Link
            key={card.href}
            href={card.href}
            className={cn(
              "student-glass-card group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5",
              card.tint
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] border border-white/10 text-[#dbb85a]">
                <Icon size={22} weight="duotone" />
              </div>
              {count != null && (
                <span className="text-xs font-bold tabular-nums text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-full px-2 py-0.5">
                  {count}
                </span>
              )}
            </div>
            <p className="mt-4 font-semibold text-pt text-sm">{card.title}</p>
            <p className="text-xs text-pt-muted mt-0.5">{card.subtitle}</p>
            <ArrowRight
              size={14}
              weight="bold"
              className="absolute bottom-4 right-4 text-pt-faint opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
            />
          </Link>
        );
      })}
    </div>
  );
}
