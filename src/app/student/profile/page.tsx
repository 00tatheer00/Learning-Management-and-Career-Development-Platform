import { getCurrentUser } from "@/lib/auth/session";
import { getProgramBySlug } from "@/lib/data/programs";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { ProgramCategoryBadge } from "@/components/portal/program-category-badge";
import { UserCircle, Envelope, Phone, BookOpen, GraduationCap, ChalkboardTeacher } from "@phosphor-icons/react/ssr";
import { getTrainersByProgramSlug } from "@/lib/data/trainers";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const program = user.programSlug ? getProgramBySlug(user.programSlug) : null;
  const category = user.programSlug ? getProgramCategory(user.programSlug) : null;
  const trainer = user.programSlug
    ? getTrainersByProgramSlug(user.programSlug).find((t) => t.id === user.trainerId) ??
      getTrainersByProgramSlug(user.programSlug).find((t) => t.featured)
    : null;

  const fields = [
    { icon: UserCircle, label: STUDENT_UR.profile.fullName, value: user.name },
    { icon: Envelope, label: STUDENT_UR.profile.email, value: user.email },
    { icon: Phone, label: STUDENT_UR.profile.phone, value: user.phone ?? STUDENT_UR.profile.empty },
    { icon: BookOpen, label: STUDENT_UR.profile.program, value: category?.sidebarLabel ?? program?.title ?? STUDENT_UR.profile.empty },
    { icon: GraduationCap, label: STUDENT_UR.profile.module, value: user.level ?? STUDENT_UR.profile.empty },
    { icon: ChalkboardTeacher, label: STUDENT_UR.profile.trainer, value: trainer?.name ?? STUDENT_UR.profile.empty },
  ];

  return (
    <div>
      <PortalPageHeader
        title={STUDENT_UR.profile.title}
        description={STUDENT_UR.profile.description}
      >
        {user.programSlug && <ProgramCategoryBadge programSlug={user.programSlug} />}
      </PortalPageHeader>

      <div className="rounded-2xl border border-border bg-background overflow-hidden max-w-xl">
        <div className="bg-gradient-to-r from-primary to-orange-400 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold">{user.name}</p>
              <p className="text-sm opacity-80">{STUDENT_UR.profile.studentAccount}</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-4">
              <Icon size={22} weight="duotone" className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
