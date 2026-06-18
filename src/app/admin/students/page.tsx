import { getUsersByRole } from "@/lib/auth/users";
import { getProgramBySlug } from "@/lib/data/programs";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";

export default async function AdminStudentsPage() {
  const students = await getUsersByRole("student");

  return (
    <div>
      <PortalPageHeader title="All Students" description="Students with portal accounts (created after registration approval)." />
      {students.length === 0 ? (
        <EmptyState title="No students yet" description="Approve registrations to create student accounts automatically." />
      ) : (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Course</th>
                <th className="text-left px-5 py-3 font-semibold">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-surface/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-muted">{s.email}</td>
                  <td className="px-5 py-4 hidden md:table-cell text-muted">
                    {s.programSlug ? getProgramBySlug(s.programSlug)?.title : "—"}
                  </td>
                  <td className="px-5 py-4">{s.level ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
