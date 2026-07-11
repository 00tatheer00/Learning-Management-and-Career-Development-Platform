import "server-only";

import Link from "next/link";
import { WarningCircle, Flame } from "@phosphor-icons/react/ssr";
import { getStudentAttendanceSummary } from "@/lib/api/class-attendance";
import { getLiveSessionsPreview } from "@/lib/api/portal-data";
import { studentHasModuleLiveContent } from "@/lib/modules/student-module-content";
import { cn } from "@/lib/utils";

interface StudentAttendanceMissedAlertProps {
  programSlug: string;
  studentId: string;
  studentLevel?: string | null;
  studentEmail?: string | null;
  className?: string;
}

export async function StudentAttendanceMissedAlert({
  programSlug,
  studentId,
  studentLevel,
  studentEmail,
  className,
}: StudentAttendanceMissedAlertProps) {
  const moduleContext = {
    programSlug,
    studentLevel: studentLevel ?? null,
    approvedLevels: studentLevel ? [studentLevel] : [],
    email: studentEmail,
  };
  const sessions = await getLiveSessionsPreview(programSlug);
  const canTrack = studentHasModuleLiveContent(moduleContext, sessions);
  if (!canTrack) return null;

  const stats = await getStudentAttendanceSummary(studentId, programSlug);
  if (stats.consecutiveMissed < 2) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-50 to-rose-100 p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-rose-600 p-2 text-white shrink-0">
          <WarningCircle size={22} weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-rose-900">
            You missed {stats.consecutiveMissed} classes in a row
          </p>
          <p className="text-sm text-rose-800 mt-1">
            Join the next live class from the portal to get back on track. You need{" "}
            {stats.goalPercent}% attendance to stay eligible.
          </p>
          <Link
            href="/student/classes"
            className="inline-flex mt-3 text-sm font-bold text-rose-900 underline underline-offset-2"
          >
            Go to Live Classes
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AttendanceStreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
      <Flame size={14} weight="fill" />
      {streak}-class streak
    </span>
  );
}
