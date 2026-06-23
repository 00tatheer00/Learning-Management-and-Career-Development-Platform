import { getAdminStudentRows } from "@/lib/api/admin-students";
import { getAdminProgramStats } from "@/lib/api/admin-program-stats";
import { AdminStudentsTable } from "@/components/admin/admin-students-table";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { getProgramCategory } from "@/lib/constants/program-categories";

export default async function AdminStudentsPage() {
  const [students, programStats] = await Promise.all([
    getAdminStudentRows(),
    getAdminProgramStats(),
  ]);

  return (
    <div>
      <PortalPageHeader
        title="Students by Program"
        description="Active portal accounts by course. Paid registration count may be higher when students re-register for a new module."
      />

      {students.length > 0 && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-muted">Active Students</p>
            <p className="text-2xl font-bold">{programStats.activeStudents}</p>
            {programStats.inactiveStudents > 0 && (
              <p className="text-xs text-muted mt-1">
                +{programStats.inactiveStudents} inactive
              </p>
            )}
          </div>
          {programStats.byProgram.map((row) => {
            const category = getProgramCategory(row.programSlug);
            return (
              <div key={row.programSlug} className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm text-muted">{category?.title ?? row.programSlug}</p>
                <p className="text-2xl font-bold">{row.students}</p>
                <p className="text-xs text-muted mt-1">
                  {row.registrations} paid registration{row.registrations === 1 ? "" : "s"} ·{" "}
                  {row.trainerAssigned} with trainer
                </p>
              </div>
            );
          })}
        </div>
      )}

      {students.length === 0 ? (
        <EmptyState
          title="No students yet"
          description="Approve registrations to create student accounts automatically."
        />
      ) : (
        <AdminStudentsTable students={students} />
      )}
    </div>
  );
}
