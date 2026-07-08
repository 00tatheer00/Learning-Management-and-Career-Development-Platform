import Link from "next/link";
import {
  Bell,
  CalendarBlank,
  ChatsCircle,
  UserCircle,
} from "@phosphor-icons/react/ssr";
import { PortalAvatar } from "@/components/portal/portal-avatar";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { cn } from "@/lib/utils";

type Reminder = {
  id: string;
  label: string;
  sub?: string;
  href: string;
  icon: "bell" | "calendar" | "chat";
};

function ReminderIcon({ type }: { type: Reminder["icon"] }) {
  if (type === "calendar") return <CalendarBlank size={16} weight="duotone" className="text-[#c9a84c]" />;
  if (type === "chat") return <ChatsCircle size={16} weight="duotone" className="text-[#c9a84c]" />;
  return <Bell size={16} weight="duotone" className="text-[#c9a84c]" />;
}

export function StudentDashboardRail({
  name,
  avatarUrl,
  avatarInitials,
  programSlug,
  moduleName,
  classDates,
  reminders,
}: {
  name: string;
  avatarUrl?: string;
  avatarInitials?: string;
  programSlug: string;
  moduleName?: string | null;
  classDates: string[];
  reminders: Reminder[];
}) {
  const category = getProgramCategory(programSlug);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const classDaySet = new Set(
    classDates
      .map((d) => {
        const parsed = new Date(d);
        if (parsed.getMonth() !== month || parsed.getFullYear() !== year) return null;
        return parsed.getDate();
      })
      .filter((d): d is number => d != null)
  );

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-4">
      <div className="student-glass-card rounded-2xl p-5 text-center">
        <PortalAvatar
          name={name}
          avatarUrl={avatarUrl}
          avatarInitials={avatarInitials}
          size="lg"
          className="mx-auto ring-2 ring-[#c9a84c]/30"
        />
        <p className="mt-3 font-semibold text-pt">{name}</p>
        <p className="text-xs text-pt-muted mt-0.5">Student · {category?.shortLabel ?? "Course"}</p>
        {moduleName && (
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#c9a84c]/80 mt-1">
            {moduleName}
          </p>
        )}
        <Link
          href="/student/profile"
          className="mt-4 inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-[#c9a84c]/25 bg-[#c9a84c]/10 py-2 text-xs font-semibold text-[#dbb85a] hover:bg-[#c9a84c]/18 transition-colors"
        >
          <UserCircle size={16} weight="duotone" />
          Profile
        </Link>
      </div>

      <div className="student-glass-card rounded-2xl p-4">
        <p className="text-xs font-semibold text-pt mb-3">{monthLabel}</p>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-pt-faint mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={`${d}-${i}`}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            const isToday = day === now.getDate();
            const hasClass = day != null && classDaySet.has(day);
            return (
              <div
                key={i}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-lg text-[11px] font-medium",
                  day == null && "invisible",
                  isToday && "bg-[#c9a84c] text-[#0a0a0b]",
                  !isToday && hasClass && "bg-[#c9a84c]/20 text-[#dbb85a] border border-[#c9a84c]/30",
                  !isToday && !hasClass && day != null && "text-pt-muted"
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="student-glass-card rounded-2xl p-4">
        <p className="text-xs font-semibold text-pt mb-3">Reminders</p>
        {reminders.length === 0 ? (
          <p className="text-xs text-pt-muted">You&apos;re all caught up.</p>
        ) : (
          <ul className="space-y-2.5">
            {reminders.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-start gap-2.5 rounded-xl p-2 -mx-2 hover:bg-white/[0.04] transition-colors"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/15">
                    <ReminderIcon type={item.icon} />
                  </span>
                  <span className="min-w-0">
                    <p className="text-xs font-medium text-pt leading-snug">{item.label}</p>
                    {item.sub && <p className="text-[10px] text-pt-muted mt-0.5">{item.sub}</p>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
