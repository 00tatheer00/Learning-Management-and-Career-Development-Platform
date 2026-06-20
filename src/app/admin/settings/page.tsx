import { PortalPageHeader } from "@/components/portal/portal-ui";
import { Key, Envelope, ChatsCircle, Globe } from "@phosphor-icons/react/ssr";
import { SITE_CONFIG } from "@/lib/constants";
import { getPortalLoginUrl } from "@/lib/site-url";
import { getUltraMsgInstanceStatus } from "@/lib/notifications/whatsapp";

export default async function AdminSettingsPage() {
  const whatsappStatus = await getUltraMsgInstanceStatus();

  return (
    <div>
      <PortalPageHeader
        title="Settings"
        description="Portal configuration and production checklist."
      />

      <div className="space-y-4 max-w-2xl">
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center gap-3 mb-3">
            <Key size={24} weight="duotone" className="text-primary" />
            <h2 className="font-bold">Student Accounts</h2>
          </div>
          <p className="text-sm text-muted">
            When you approve a registration, a random 8-character portal password is created.
            Login details are sent by email and WhatsApp. Username is the student&apos;s email.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Envelope size={24} weight="duotone" className="text-amber-700" />
            <h2 className="font-bold text-amber-900">Email (Resend)</h2>
          </div>
          <p className="text-sm text-amber-900/90 leading-relaxed">
            Emails only work after you verify <strong>emergingedge.tech</strong> at{" "}
            <a href="https://resend.com/domains" className="underline" target="_blank" rel="noopener noreferrer">
              resend.com/domains
            </a>
            . Then set Vercel env <code className="bg-white/80 px-1 rounded">EMAIL_FROM</code> to{" "}
            <code className="bg-white/80 px-1 rounded">EEST &lt;noreply@emergingedge.tech&gt;</code>.
            Gmail addresses cannot be used as the sender.
          </p>
        </div>

        <div
          className={`rounded-2xl border p-5 ${
            whatsappStatus.connected
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <ChatsCircle size={24} weight="duotone" className="text-emerald-600" />
            <h2 className="font-bold">WhatsApp (UltraMsg)</h2>
          </div>
          <p className="text-sm leading-relaxed">
            <strong>Status:</strong>{" "}
            {whatsappStatus.connected
              ? "Connected — messages will send"
              : whatsappStatus.configured
                ? `Not connected (${whatsappStatus.status ?? "unknown"})`
                : "Not configured on server"}
          </p>
          {!whatsappStatus.connected && (
            <p className="mt-2 text-sm leading-relaxed">
              {whatsappStatus.error ??
                "Open ultramsg.com → instance181496 → scan QR with your WhatsApp. Until connected, approval messages will not deliver."}
            </p>
          )}
          <p className="mt-3 text-sm text-muted">
            Vercel env vars:{" "}
            <code className="bg-surface px-1 rounded">ULTRAMSG_INSTANCE_ID</code> and{" "}
            <code className="bg-surface px-1 rounded">ULTRAMSG_TOKEN</code>
          </p>
        </div>

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
