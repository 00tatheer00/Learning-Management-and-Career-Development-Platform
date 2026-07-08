import Link from "next/link";
import { CalendarBlank, Clock, User } from "@phosphor-icons/react/ssr";
type SessionRow = {
  id: string;
  title: string;
  date: string;
  time: string;
  trainerName: string;
};

export function StudentUpcomingLessonsTable({
  sessions,
  canJoinLive,
}: {
  sessions: SessionRow[];
  canJoinLive: boolean;
}) {
  const rows = sessions.slice(0, 6);

  return (
    <div className="student-glass-card rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div>
          <p className="text-sm font-semibold text-pt">Upcoming lessons</p>
          <p className="text-xs text-pt-muted mt-0.5">Your scheduled live classes</p>
        </div>
        <Link
          href="/student/classes"
          className="text-xs font-semibold text-[#c9a84c] hover:text-[#dbb85a] transition-colors"
        >
          View all
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-pt-muted">
          No classes scheduled yet. Check back soon or join the WhatsApp group for updates.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-pt-faint border-b border-white/[0.04]">
                <th className="px-5 py-3 font-semibold">Lesson</th>
                <th className="px-3 py-3 font-semibold hidden sm:table-cell">Trainer</th>
                <th className="px-3 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.map((session) => (
                <tr key={session.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-pt truncate max-w-[180px] sm:max-w-none">
                      {session.title}
                    </p>
                    <p className="text-xs text-pt-muted sm:hidden mt-0.5 flex items-center gap-1">
                      <User size={12} />
                      {session.trainerName}
                    </p>
                  </td>
                  <td className="px-3 py-3.5 text-pt-muted hidden sm:table-cell">
                    {session.trainerName}
                  </td>
                  <td className="px-3 py-3.5 text-pt-muted whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <CalendarBlank size={14} className="text-[#c9a84c]/70 shrink-0" />
                      {session.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs mt-0.5">
                      <Clock size={12} className="shrink-0" />
                      {session.time}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {canJoinLive ? (
                      <Link
                        href="/student/classes"
                        className="inline-flex items-center rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#dbb85a] hover:bg-[#c9a84c]/25 transition-colors"
                      >
                        Open
                      </Link>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-1 text-[10px] font-medium text-pt-muted">
                        Soon
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
