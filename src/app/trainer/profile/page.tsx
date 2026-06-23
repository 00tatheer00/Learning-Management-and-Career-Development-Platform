import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getTrainerCourseTitle, getTrainerDesignation } from "@/lib/auth/trainer-scope";
import { prisma } from "@/lib/prisma";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { UserCircle, Envelope, Phone, BookOpen, PencilSimple } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

export default async function TrainerProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) redirect("/login");

  const designation = user.designation ?? getTrainerDesignation(user.programSlug ?? undefined);
  const courseTitle = user.programSlug ? getTrainerCourseTitle(user.programSlug) : "—";

  return (
    <div>
      <PortalPageHeader title="My Profile" description="Your trainer account details.">
        <Button size="lg" asChild className="gap-2">
          <Link href="/trainer/settings">
            <PencilSimple size={18} />
            Edit Profile
          </Link>
        </Button>
      </PortalPageHeader>
      <div className="rounded-2xl border border-border bg-background max-w-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <p className="text-xl font-bold">{user.name}</p>
          <p className="text-sm opacity-90">{designation}</p>
        </div>
        <div className="divide-y divide-border">
          {[
            { icon: UserCircle, label: "Name", value: user.name },
            { icon: BookOpen, label: "Course", value: courseTitle },
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
