import { getCurrentUser } from "@/lib/auth/session";
import { filterStudentsByProgram, getTrainerCourseTitle, getTrainerDesignation } from "@/lib/auth/trainer-scope";
import { getUsersByRole } from "@/lib/auth/users";
import { getProgramBySlug } from "@/lib/data/programs";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { GraduationCap, Phone, Envelope } from "@phosphor-icons/react/ssr";

export default async function TrainerStudentsPage() {
  const user = await getCurrentUser();
  if (!user?.programSlug) {
    return <EmptyState title="No course assigned" description="Contact admin to link your trainer account to a course." />;
  }

  const allStudents = await getUsersByRole("student");
  const students = filterStudentsByProgram(allStudents, user.programSlug);
  const courseTitle = getTrainerCourseTitle(user.programSlug);

  return (
    <div>
      <PortalPageHeader
        title="My Students"
        description={`Students enrolled in ${courseTitle} (${getTrainerDesignation(user.programSlug)}).`}
      />

      {students.length === 0 ? (
        <EmptyState title="No students yet" description="Students appear here after admin approves their registration for your course." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => {
            const program = student.programSlug ? getProgramBySlug(student.programSlug) : null;
            return (
              <div key={student.id} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted">{program?.title ?? courseTitle}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted">
                  <p className="flex items-center gap-2">
                    <GraduationCap size={16} weight="duotone" className="text-primary" />
                    Level: {student.level ?? "—"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Envelope size={16} weight="duotone" className="text-primary" />
                    {student.email}
                  </p>
                  {student.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={16} weight="duotone" className="text-primary" />
                      {student.phone}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
