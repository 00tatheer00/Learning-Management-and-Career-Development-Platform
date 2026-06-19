import { getCurrentUser } from "@/lib/auth/session";
import { getProgramBySlug } from "@/lib/data/programs";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { UserCircle, Envelope, Phone, BookOpen, GraduationCap } from "@phosphor-icons/react/ssr";

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const program = user.programSlug ? getProgramBySlug(user.programSlug) : null;

  const fields = [
    { icon: UserCircle, label: "Full Name", value: user.name },
    { icon: Envelope, label: "Email", value: user.email },
    { icon: Phone, label: "Phone / WhatsApp", value: user.phone ?? "—" },
    { icon: BookOpen, label: "Course", value: program?.title ?? "—" },
    { icon: GraduationCap, label: "Current Module", value: user.level ?? "—" },
  ];

  return (
    <div>
      <PortalPageHeader
        title="My Profile"
        description="Your account details. Contact admin if anything is wrong."
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden max-w-xl">
        <div className="bg-gradient-to-r from-primary to-orange-400 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold">{user.name}</p>
              <p className="text-sm opacity-80">Student Account</p>
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
