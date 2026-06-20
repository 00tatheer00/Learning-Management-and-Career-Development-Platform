import { getAdminStudentRows } from "@/lib/api/admin-students";
import { AdminStudentsTable } from "@/components/admin/admin-students-table";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramCategory } from "@/lib/constants/program-categories";

export default async function AdminStudentsPage() {
  const students = await getAdminStudentRows();
  const webCount = students.filter((s) => s.programSlug === "web-development").length;
  const appCount = students.filter((s) => s.programSlug === "app-development").length;

  return (
    <div>
      <PortalPageHeader
        title="Students by Program"
        description="Web and App students are separated by category. Approving a registration automatically assigns the correct program and trainer."
      />

      {students.length > 0 && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-muted">Total Students</p>
            <p className="text-2xl font-bold">{students.length}</p>
          </div>
          {ENROLLABLE_PROGRAM_SLUGS.map((slug) => {
            const category = getProgramCategory(slug);
            const count = slug === "web-development" ? webCount : appCount;
            return (
              <div key={slug} className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm text-muted">{category?.title ?? slug}</p>
                <p className="text-2xl font-bold">{count}</p>
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
