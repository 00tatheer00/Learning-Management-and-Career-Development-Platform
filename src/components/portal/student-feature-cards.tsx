import Link from "next/link";
import {
  VideoCamera,
  ClipboardText,
  FilmStrip,
  Certificate,
  ArrowRight,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

const cards = [
  {
    href: "/student/recordings",
    title: "Recordings",
    subtitle: "Video lessons & syllabus",
    icon: FilmStrip,
    tint: "student-glass-card-gold",
    key: "recordings" as const,
  },
  {
    href: "/student/classes",
    title: "Live Classes",
    subtitle: "Join online sessions",
    icon: VideoCamera,
    tint: "student-glass-card-charcoal",
    key: "classes" as const,
  },
  {
    href: "/student/assignments",
    title: "Assignments",
    subtitle: "Homework & tasks",
    icon: ClipboardText,
    tint: "student-glass-card-muted",
    key: "tasks" as const,
  },
  {
    href: "/student/certificates",
    title: "Certificates",
    subtitle: "Verified credentials",
    icon: Certificate,
    tint: "student-glass-card-warm",
    key: "certificates" as const,
  },
] as const;

export function StudentFeatureCards({
  counts,
}: {
  counts: { recordings?: number; lessons?: number; classes: number; tasks: number; certificates?: number };
}) {
  const countMap: Record<string, number | undefined> = {
    recordings: counts.recordings ?? counts.lessons,
    classes: counts.classes,
    tasks: counts.tasks,
    certificates: counts.certificates,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const count = countMap[card.key];
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] border border-white/10 text-primary">
                <Icon size={22} weight="duotone" />
              </div>
              {count != null && (
                <span className="text-xs font-bold tabular-nums text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
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
