import { getCurrentUser } from "@/lib/auth/session";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { UserCircle, Envelope, Phone } from "@phosphor-icons/react/ssr";

export default async function TrainerProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div>
      <PortalPageHeader title="My Profile" description="Your trainer account details." />
      <div className="rounded-2xl border border-border bg-background max-w-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <p className="text-xl font-bold">{user.name}</p>
          <p className="text-sm opacity-80">Trainer Account</p>
        </div>
        <div className="divide-y divide-border">
          {[
            { icon: UserCircle, label: "Name", value: user.name },
            { icon: Envelope, label: "Email", value: user.email },
            { icon: Phone, label: "Phone", value: user.phone ?? "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-4">
              <Icon size={22} weight="duotone" className="text-blue-600 shrink-0" />
              <div>
                <p className="text-xs text-muted uppercase">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
