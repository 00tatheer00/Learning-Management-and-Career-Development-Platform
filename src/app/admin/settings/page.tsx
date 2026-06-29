import { PortalPageHeader } from "@/components/portal/portal-ui";
import { Key, Envelope, Globe } from "@phosphor-icons/react/ssr";
import { SITE_CONFIG } from "@/lib/constants";
import { getPortalLoginUrl } from "@/lib/site-url";
import { AdminNotificationSettings } from "@/components/admin/admin-notification-settings";
import { AdminWhatsAppSettings } from "@/components/admin/admin-whatsapp-settings";

export default async function AdminSettingsPage() {
  return (
    <div>
      <PortalPageHeader
        title="Settings"
        description="Portal configuration and production checklist."
      />

      <div className="space-y-4 max-w-2xl">
        <AdminNotificationSettings />

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center gap-3 mb-3">
            <Key size={24} weight="duotone" className="text-primary" />
            <h2 className="font-bold">Student Accounts</h2>
          </div>
          <p className="text-sm text-muted">
            When you approve a registration, a random 8-character portal password is created and
            saved under <strong>Portal Logins</strong>. Login details are sent on{" "}
            <strong>WhatsApp</strong>. Username is the student&apos;s email.
          </p>
        </div>

        <div className="rounded-2xl portal-callout-amber p-5">
          <div className="flex items-center gap-3 mb-3">
            <Envelope size={24} weight="duotone" className="opacity-80" />
            <h2 className="font-bold">Email (Resend)</h2>
          </div>
          <p className="text-sm leading-relaxed opacity-90">
            Student notifications currently use <strong>WhatsApp only</strong>. Email (Resend) is
            disabled until domain verification is complete. When ready, verify{" "}
            <strong>emergingedge.tech</strong> at{" "}
            <a href="https://resend.com/domains" className="underline" target="_blank" rel="noopener noreferrer">
              resend.com/domains
            </a>
            . Then set Vercel env <code className="portal-code-inline px-1 rounded text-[11px]">EMAIL_FROM</code> to{" "}
            <code className="portal-code-inline px-1 rounded text-[11px]">EEST &lt;noreply@emergingedge.tech&gt;</code>.
            Gmail addresses cannot be used as the sender.
          </p>
        </div>

        <AdminWhatsAppSettings />

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center gap-3 mb-3">
            <Globe size={24} weight="duotone" className="text-blue-600" />
            <h2 className="font-bold">Live URLs</h2>
          </div>
          <ul className="text-sm space-y-2 text-muted">
            <li><strong>Website:</strong> {SITE_CONFIG.url}</li>
            <li><strong>Login:</strong> {getPortalLoginUrl()}</li>
            <li><strong>Register:</strong> {SITE_CONFIG.url}/register</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
