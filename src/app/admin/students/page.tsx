import { getAdminStudentRows } from "@/lib/api/admin-students";
import { AdminStudentsTable } from "@/components/admin/admin-students-table";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";

export default async function AdminStudentsPage() {
  const students = await getAdminStudentRows();

  return (
    <div>
      <PortalPageHeader
        title="All Students"
        description="Approved students with full registration details. Web and App students are in Batch 1."
      />

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
