import type { Metadata } from "next";
import Link from "next/link";
import {
  Lifebuoy,
  Clock,
  CheckCircle,
  ShieldCheck,
  Headset,
  Envelope,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Support — ${SITE_CONFIG.name}`,
  description: "Need help? Submit a support ticket and track your issue. Our team responds within 48 hours.",
};

export default function PublicSupportPage() {
  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Lifebuoy size={32} weight="duotone" className="text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            How can we <span className="gradient-text">help you?</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Have a question or facing an issue? Our support team is here to help.
            Students can submit and track tickets directly from the portal.
          </p>
        </div>

        {/* CTA Card — Login to submit ticket */}
        <div className="mb-14 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 sm:p-8 text-center">
          <Headset size={28} weight="duotone" className="text-primary mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Student Support Portal</h2>
          <p className="text-sm text-muted mb-5 max-w-lg mx-auto">
            Enrolled students can submit support tickets, track issue status, and receive replies — all from within the student portal.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-[0.97]"
          >
            Login to Submit Ticket
            <ArrowRight size={16} weight="bold" />
          </Link>
          <p className="text-xs text-muted mt-3">
            Already logged in? Go directly to{" "}
            <Link href="/student/support" className="text-primary font-semibold hover:underline">
              Support Center →
            </Link>
          </p>
        </div>

        {/* How it works */}
        <div className="mb-14">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-primary/70 mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-background p-6 text-center hover:border-primary/30 hover:shadow-md transition-all duration-300">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Envelope size={24} weight="duotone" />
              </div>
              <h3 className="font-bold text-base mb-2">1. Submit a Ticket</h3>
              <p className="text-sm text-muted leading-relaxed">
                Login to your student portal, go to Support, select a category and describe your issue in detail.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 text-center hover:border-primary/30 hover:shadow-md transition-all duration-300">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Clock size={24} weight="duotone" />
              </div>
              <h3 className="font-bold text-base mb-2">2. We Review It</h3>
              <p className="text-sm text-muted leading-relaxed">
                Our team reviews your ticket and responds within <strong>48 hours</strong>. You&apos;ll see the status update in real-time.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 text-center hover:border-primary/30 hover:shadow-md transition-all duration-300">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle size={24} weight="duotone" />
              </div>
              <h3 className="font-bold text-base mb-2">3. Issue Resolved</h3>
              <p className="text-sm text-muted leading-relaxed">
                Once resolved, you&apos;ll get a notification with the admin&apos;s response. Track everything from your portal.
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-14">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-primary/70 mb-8">
            What We Can Help With
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { emoji: "🔑", label: "Login & Password", desc: "Can't access your account?" },
              { emoji: "📚", label: "Course & Modules", desc: "Module locked or content missing?" },
              { emoji: "💳", label: "Payment Issues", desc: "Payment verification or screenshot?" },
              { emoji: "📝", label: "Assignments", desc: "Submission or grading issues?" },
              { emoji: "📹", label: "Live Classes", desc: "Class link or attendance problems?" },
              { emoji: "💬", label: "General Query", desc: "Anything else we can help with?" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-background p-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
              >
                <span className="text-2xl mb-2 block">{item.emoji}</span>
                <p className="font-semibold text-sm mb-0.5">{item.label}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Promise */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center">
          <ShieldCheck size={28} weight="fill" className="text-emerald-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-emerald-900 mb-2">Our Commitment</h2>
          <p className="text-sm text-emerald-800 max-w-lg mx-auto leading-relaxed">
            Every support ticket receives a response within <strong>48 hours</strong>.
            Each ticket gets a unique tracking number so you can monitor its progress anytime.
          </p>
        </div>

        {/* Contact fallback */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted">
            Not a student yet?{" "}
            <Link href="/contact" className="text-primary font-semibold hover:underline">
              Contact us
            </Link>{" "}
            directly or email us at{" "}
            <a href={`mailto:${SITE_CONFIG.email}`} className="text-primary font-semibold hover:underline">
              {SITE_CONFIG.email}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
