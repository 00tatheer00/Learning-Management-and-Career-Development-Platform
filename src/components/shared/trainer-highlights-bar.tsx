import Link from "next/link";
import {
  ChalkboardTeacher,
  ChartLineUp,
  FolderOpen,
  Trophy,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";

const HIGHLIGHTS = [
  {
    icon: UsersThree,
    title: "Learn from Experts",
    description: "Industry professionals with real-world experience",
  },
  {
    icon: ChartLineUp,
    title: "Practical Approach",
    description: "Hands-on projects and real-world applications",
  },
  {
    icon: FolderOpen,
    title: "Career Support",
    description: "Guidance for job placement and freelancing",
  },
  {
    icon: Trophy,
    title: "Proven Results",
    description: "1000+ successful students and counting",
  },
] as const;

export function TrainerHighlightsBar() {
  return (
    <div className="mt-10 rounded-[1.75rem] border border-primary/10 bg-[#FFF4EC] px-4 py-6 sm:px-8 sm:py-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-start gap-3 border-border/60 xl:border-r xl:pr-6 xl:last:border-r-0"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={22} weight="duotone" aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
