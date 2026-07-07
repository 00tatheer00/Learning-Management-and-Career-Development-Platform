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
    <div className="rounded-2xl border border-border bg-background p-5 sm:p-6 mb-8 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Key size={22} weight="duotone" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Your Module Logins</h2>
          <p className="text-sm text-muted">
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
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-surface/40"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{entry.moduleName}</p>
              {entry.canJoinLiveClasses ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                  Live classes open
                </span>
              ) : (
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-800">
                  Starts later
                </span>
              )}
            </div>

            <div className="grid gap-2 text-sm">
              <p>
                <span className="text-muted">Login ID:</span>{" "}
                <span className="font-mono font-medium">{entry.loginId}</span>
              </p>
              <p>
                <span className="text-muted">Password:</span>{" "}
                <span className="font-mono font-medium">
                  {entry.password ?? "Ask admin to resend from Portal Logins"}
                </span>
              </p>
              <p>
                <span className="text-muted">Portal:</span>{" "}
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
