import { getCurrentUser } from "@/lib/auth/session";
import { getProgramBySlug } from "@/lib/data/programs";
import { getProgramCategory, PREMIUM_HEADER_GRADIENT_FALLBACK } from "@/lib/constants/program-categories";
import { PortalPageHeader, PortalSurfaceCard } from "@/components/portal/portal-ui";
import { ProgramCategoryBadge } from "@/components/portal/program-category-badge";
import { StudentModuleEnrollmentsCard } from "@/components/portal/student-module-enrollments-card";
import { getStudentModuleEnrollmentViews } from "@/lib/api/student-module-enrollments";
import { UserCircle, Envelope, Phone, BookOpen, GraduationCap, ChalkboardTeacher } from "@phosphor-icons/react/ssr";
import { getTrainersByProgramSlug } from "@/lib/data/trainers";
import { cn } from "@/lib/utils";

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const program = user.programSlug ? getProgramBySlug(user.programSlug) : null;
  const category = user.programSlug ? getProgramCategory(user.programSlug) : null;
  const trainer = user.programSlug
    ? getTrainersByProgramSlug(user.programSlug).find((t) => t.id === user.trainerId) ??
      getTrainersByProgramSlug(user.programSlug).find((t) => t.featured)
    : null;
  const moduleEnrollments =
    user.programSlug && user.email
      ? await getStudentModuleEnrollmentViews(user.email, user.programSlug)
      : [];

  const fields = [
    { icon: UserCircle, label: "Full Name", value: user.name },
    { icon: Envelope, label: "Email", value: user.email },
    { icon: Phone, label: "Phone / WhatsApp", value: user.phone ?? "—" },
    { icon: BookOpen, label: "Program Category", value: category?.sidebarLabel ?? program?.title ?? "—" },
    { icon: GraduationCap, label: "Active Module", value: user.level ?? "—" },
    { icon: ChalkboardTeacher, label: "Assigned Trainer", value: trainer?.name ?? "—" },
  ];

  const gradient = category?.headerGradient ?? PREMIUM_HEADER_GRADIENT_FALLBACK;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Account"
        title="My Profile"
        description="Your account details. Contact admin if anything needs updating."
      >
        {user.programSlug && <ProgramCategoryBadge programSlug={user.programSlug} />}
      </PortalPageHeader>

      <PortalSurfaceCard className="overflow-hidden max-w-2xl p-0">
        <div className={cn("p-6 sm:p-8 text-white bg-gradient-to-br", gradient)}>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold border border-white/25">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold">{user.name}</p>
              <p className="text-sm text-white/85">Student Account</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-pt-subtle">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-5 sm:px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={20} weight="duotone" />
              </div>
              <div>
                <p className="text-[10px] text-pt-faint uppercase tracking-[0.12em] font-semibold">
                  {label}
                </p>
                <p className="font-medium text-pt mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </PortalSurfaceCard>

      <StudentModuleEnrollmentsCard enrollments={moduleEnrollments} />
    </div>
  );
}
