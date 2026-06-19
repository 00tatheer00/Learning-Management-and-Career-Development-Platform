"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { EnvelopeSimple, Phone, MapPin } from "@phosphor-icons/react";
import { PageHero } from "@/components/shared/page-hero";
import { PremiumIcon } from "@/components/shared/premium-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE_CONFIG } from "@/lib/constants";
import { getOfficialTelHref } from "@/lib/constants/contact";
import { toast } from "@/lib/ui/toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error("Could not send message", result.message ?? "Try again later.");
        return;
      }
      setIsSuccess(true);
      toast.success("Message sent!", "We will reply within 1–2 business days.");
      reset();
    } catch {
      toast.error("Something went wrong", "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        label="Contact"
        title="Get in Touch"
        description="Have questions about our programs or admissions? We're here to help."
      />

      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="group rounded-xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <PremiumIcon icon={EnvelopeSimple} size="md" className="mb-4" />
                <h3 className="font-semibold mb-1">Email</h3>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="text-sm text-muted hover:text-primary transition-colors"
                >
                  {SITE_CONFIG.email}
                </a>
              </div>
              <div className="group rounded-xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <PremiumIcon icon={Phone} size="md" className="mb-4" />
                <h3 className="font-semibold mb-1">Phone</h3>
                <a
                  href={getOfficialTelHref()}
                  className="text-sm text-muted hover:text-primary transition-colors"
                >
                  {SITE_CONFIG.phone}
                </a>
              </div>
              <div className="group rounded-xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <PremiumIcon icon={MapPin} size="md" className="mb-4" />
                <h3 className="font-semibold mb-1">Location</h3>
                <p className="text-sm text-muted">{SITE_CONFIG.address}</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              {isSuccess ? (
                <div className="rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
                  <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
                  <p className="text-muted mb-4">
                    We&apos;ll get back to you within 1-2 business days.
                  </p>
                  <Button onClick={() => setIsSuccess(false)}>Send Another</Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="rounded-2xl border border-border bg-background p-6 lg:p-8 space-y-6 shadow-sm"
                  noValidate
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" className="mt-2" {...register("name")} />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        className="mt-2"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" className="mt-2" {...register("subject")} />
                    {errors.subject && (
                      <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      rows={5}
                      className="flex w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-2"
                      {...register("message")}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
