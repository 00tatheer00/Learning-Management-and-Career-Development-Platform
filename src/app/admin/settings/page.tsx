import { PortalPageHeader } from "@/components/portal/portal-ui";
import { Gear, Key, Database, ShieldCheck } from "@phosphor-icons/react/ssr";

export default function AdminSettingsPage() {
  return (
    <div>
      <PortalPageHeader title="Settings" description="Portal configuration and demo account information." />

      <div className="space-y-4 max-w-2xl">
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center gap-3 mb-3">
            <Key size={24} weight="duotone" className="text-primary" />
            <h2 className="font-bold">Demo Login Accounts</h2>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Admin:</strong> admin@eest.com / admin123</p>
            <p><strong>Trainer:</strong> trainer@eest.com / trainer123</p>
            <p><strong>Student:</strong> student@eest.com / student123</p>
          </div>
          <p className="text-xs text-muted mt-3">When you approve a registration, a random portal password is generated and sent to the student by email and WhatsApp. Username is their email.</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center gap-3 mb-3">
            <Database size={24} weight="duotone" className="text-blue-600" />
            <h2 className="font-bold">Data Storage</h2>
          </div>
          <p className="text-sm text-muted">Enrollments, users, assignments, and sessions are stored in the <code className="bg-surface px-1 rounded">data/</code> folder. Payment screenshots are in <code className="bg-surface px-1 rounded">data/uploads/</code>.</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck size={24} weight="duotone" className="text-emerald-600" />
            <h2 className="font-bold">Security Note</h2>
          </div>
          <p className="text-sm text-muted">This is a development portal. For production, use a real database and stronger authentication.</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center gap-3 mb-3">
            <Gear size={24} weight="duotone" className="text-muted" />
            <h2 className="font-bold">Portal URLs</h2>
          </div>
          <ul className="text-sm space-y-1 text-muted">
            <li>/login — Sign in page</li>
            <li>/student/dashboard — Student portal</li>
            <li>/trainer/dashboard — Trainer portal</li>
            <li>/admin/dashboard — Admin panel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
