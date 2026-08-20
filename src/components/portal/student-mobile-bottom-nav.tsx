"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  VideoCamera,
  ClipboardText,
  BookOpen,
  Certificate,
} from "@phosphor-icons/react";
import { useStudentPortalBadgesOptional } from "@/components/portal/student-portal-badges-provider";
import { cn } from "@/lib/utils";

const STUDENT_BOTTOM_ITEMS = [
  {
    href: "/student/dashboard",
    label: "Home",
    icon: House,
  },
  {
    href: "/student/classes",
    label: "Classes",
    icon: VideoCamera,
    badgeKey: "classes" as const,
  },
  {
    href: "/student/assignments",
    label: "Tasks",
    icon: ClipboardText,
    badgeKey: "assignments" as const,
  },
  {
    href: "/student/course",
    label: "Course",
    icon: BookOpen,
  },
  {
    href: "/student/certificates",
    label: "Certificates",
    icon: Certificate,
    badgeKey: "certificates" as const,
  },
];

export function StudentMobileBottomNav() {
  const pathname = usePathname();
  const badges = useStudentPortalBadgesOptional();

  return (
    <nav
      aria-label="Student Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
    >
      <div className="mx-auto max-w-md rounded-2xl border border-pt-subtle/80 bg-pt-surface/95 backdrop-blur-xl shadow-xl px-2 py-1.5 flex items-center justify-around">
        {STUDENT_BOTTOM_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/student/dashboard" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          const badgeCount =
            item.badgeKey === "assignments"
              ? badges?.assignments ?? 0
              : item.badgeKey === "classes"
                ? badges?.classes ?? 0
                : 0;

          const showCertificatesPing =
            item.badgeKey === "certificates" && (badges?.certificates ?? 0) > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none",
                isActive
                  ? "text-primary font-bold"
                  : "text-pt-muted hover:text-pt hover:bg-pt-subtle/50 active:scale-95"
              )}
            >
              {/* Active Tab Ambient Pill */}
              {isActive && (
                <span
                  className="absolute inset-0 rounded-xl bg-primary/10 -z-10 animate-in fade-in zoom-in-95 duration-150"
                  aria-hidden="true"
                />
              )}

              <div className="relative">
                <Icon
                  size={20}
                  weight={isActive ? "fill" : "duotone"}
                  className={cn(
                    "transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                />

                {/* Badge Notification */}
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-pt-surface">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}

                {/* Certificate Ready Ping Dot */}
                {showCertificatesPing && badgeCount === 0 && (
                  <span className="absolute -top-0.5 -right-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-pt-surface" />
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-0.5 font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
