import { Key } from "@phosphor-icons/react/ssr";
import type { StudentModuleEnrollmentView } from "@/lib/api/student-module-enrollments";
import { StudentModuleLoginCopyButton } from "@/components/portal/student-module-login-copy-button";
import { cn } from "@/lib/utils";

interface StudentModuleEnrollmentsCardProps {
  enrollments: StudentModuleEnrollmentView[];
}

export function StudentModuleEnrollmentsCard({
  enrollments,
}: StudentModuleEnrollmentsCardProps) {
  if (enrollments.length === 0) return null;

  return (
    <div className="portal-card rounded-2xl p-5 sm:p-6 mb-0 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Key size={22} weight="duotone" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-pt">Your Module Logins</h2>
          <p className="text-sm text-pt-muted">
            You registered for {enrollments.length} module{enrollments.length === 1 ? "" : "s"}.
            Each module has its own portal password below.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {enrollments.map((entry) => (
          <div
            key={entry.enrollmentId}
            className={cn(
              "rounded-xl border p-4 space-y-3",
              entry.canJoinLiveClasses
                ? "portal-tone-emerald"
                : "portal-tone-indigo"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-pt">{entry.moduleName}</p>
              {entry.canJoinLiveClasses ? (
                <span className="student-badge-live rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  Live classes open
                </span>
              ) : (
                <span className="student-badge-pending rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  Starts later
                </span>
              )}
            </div>

            <div className="grid gap-2 text-sm">
              <p>
                <span className="text-pt-muted">Login ID:</span>{" "}
                <span className="font-mono font-medium text-pt">{entry.loginId}</span>
              </p>
              <p>
                <span className="text-pt-muted">Password:</span>{" "}
                <span className="font-mono font-medium text-pt">
                  {entry.password ?? "Ask admin to resend from Portal Logins"}
                </span>
              </p>
              <p>
                <span className="text-pt-muted">Portal:</span>{" "}
                <a href={entry.loginUrl} className="text-primary underline break-all">
                  {entry.loginUrl}
                </a>
              </p>
            </div>

            {entry.password && (
              <StudentModuleLoginCopyButton
                moduleName={entry.moduleName}
                loginId={entry.loginId}
                password={entry.password}
                loginUrl={entry.loginUrl}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
