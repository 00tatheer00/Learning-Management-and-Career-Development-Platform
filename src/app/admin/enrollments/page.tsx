"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { getProgramBySlug } from "@/lib/data/programs";

interface Enrollment {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  cnic: string;
  status: "pending" | "approved" | "rejected";
  paymentScreenshot?: string;
  profilePhotoUrl?: string;
  createdAt: string;
  institution: string;
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const load = () =>
    fetch("/api/admin/enrollments")
      .then((r) => r.json())
      .then((d) => d.success && setEnrollments(d.data ?? []));

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setLoading(id);
    setMessage("");
    const res = await fetch("/api/admin/enrollments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        createStudentAccount: status === "approved",
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage(
        status === "approved"
          ? data.message || "Approved! Student account created and welcome message sent."
          : "Registration rejected."
      );
      load();
    }
    setLoading(null);
  };

  const filtered = filter === "all" ? enrollments : enrollments.filter((e) => e.status === filter);
  const pendingCount = enrollments.filter((e) => e.status === "pending").length;

  return (
    <div>
      <PortalPageHeader
        title="Student Registrations"
        description="Review payment screenshots and approve or reject new students."
      />

      {message && (
        <p className="mb-4 text-center font-medium text-emerald-700 bg-emerald-50 rounded-xl p-3">{message}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
              filter === f ? "bg-primary text-white" : "bg-secondary text-muted hover:text-foreground"
            }`}
          >
            {f} {f === "pending" && pendingCount > 0 ? `(${pendingCount})` : ""}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.length === 0 ? (
          <p className="text-muted text-center py-10">No registrations in this category.</p>
        ) : (
          filtered.map((enrollment) => {
            const program = getProgramBySlug(enrollment.program);
            const screenshotUrl = enrollment.paymentScreenshot?.startsWith("http")
              ? enrollment.paymentScreenshot
              : null;
            const profilePhotoUrl = enrollment.profilePhotoUrl?.startsWith("http")
              ? enrollment.profilePhotoUrl
              : null;

            return (
              <div key={enrollment.id} className="rounded-2xl border border-border bg-background overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {profilePhotoUrl ? (
                          <div className="relative h-14 w-14 rounded-full overflow-hidden border border-border shrink-0">
                            <Image src={profilePhotoUrl} alt={enrollment.fullName} fill className="object-cover" unoptimized />
                          </div>
                        ) : null}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={enrollment.status} />
                            <span className="text-xs text-muted">
                              {new Date(enrollment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold">{enrollment.fullName}</h2>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p><strong>Email:</strong> {enrollment.email}</p>
                        <p><strong>WhatsApp:</strong> {enrollment.whatsapp}</p>
                        <p><strong>CNIC:</strong> {enrollment.cnic}</p>
                        <p><strong>Institution:</strong> {enrollment.institution}</p>
                        <p><strong>Course:</strong> {program?.title ?? enrollment.program}</p>
                        <p><strong>Level:</strong> {enrollment.level}</p>
                      </div>
                    </div>

                    {screenshotUrl && (
                      <div className="shrink-0">
                        <p className="text-sm font-semibold mb-2">Payment Screenshot</p>
                        <a href={screenshotUrl} target="_blank" rel="noopener noreferrer" className="block relative w-40 h-52 rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors">
                          <Image src={screenshotUrl} alt="Payment" fill className="object-cover" unoptimized />
                        </a>
                        <p className="text-xs text-muted mt-1">Tap to enlarge</p>
                      </div>
                    )}
                  </div>

                  {enrollment.status === "pending" && (
                    <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-border">
                      <Button
                        size="lg"
                        className="gap-2"
                        disabled={loading === enrollment.id}
                        onClick={() => handleAction(enrollment.id, "approved")}
                      >
                        <CheckCircle size={20} weight="duotone" />
                        Approve &amp; Create Account
                      </Button>
                      <Button
                        size="lg"
                        variant="secondary"
                        className="gap-2 text-red-600 hover:text-red-700"
                        disabled={loading === enrollment.id}
                        onClick={() => handleAction(enrollment.id, "rejected")}
                      >
                        <XCircle size={20} weight="duotone" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };
  const icons = { pending: Clock, approved: CheckCircle, rejected: XCircle };
  const Icon = icons[status as keyof typeof icons] ?? Clock;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold uppercase px-2.5 py-1 rounded-full ${styles[status as keyof typeof styles] ?? styles.pending}`}>
      <Icon size={14} weight="duotone" />
      {status}
    </span>
  );
}
