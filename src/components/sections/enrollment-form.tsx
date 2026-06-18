"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Copy, Check } from "lucide-react";
import { GlobeHemisphereWest, DeviceMobile, WifiHigh } from "@phosphor-icons/react";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  enrollmentSchema,
  validatePaymentScreenshot,
  type EnrollmentFormData,
} from "@/lib/validations/enrollment";
import { PAYMENT_CONFIG, ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { FreeCoursePromo } from "@/components/shared/free-course-promo";
import { programs } from "@/lib/data/programs";
import { cn } from "@/lib/utils";

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 pt-2 border-t border-border first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-600 mt-1" role="alert">
      {message}
    </p>
  );
}

function YesNoField({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: "yes" | "no") => void;
  error?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex gap-3">
        {(["yes", "no"] as const).map((option) => (
          <label
            key={option}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-200",
              value === option
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border bg-background hover:border-primary/30 hover:bg-secondary"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {option === "yes" ? "Yes" : "No"}
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function PaymentInfoCard() {
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    await navigator.clipboard.writeText(PAYMENT_CONFIG.easypaisa.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <FreeCoursePromo />

      <div className="rounded-xl border border-primary/25 bg-white p-5 lg:p-6 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-1">
          How to pay your {PAYMENT_CONFIG.currency}{" "}
          {PAYMENT_CONFIG.registrationFee.toLocaleString()} registration fee
        </p>
        <p className="text-xs text-muted mb-4">
          Send payment via Easypaisa, then upload the screenshot below with your
          registration form.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Easypaisa Account
            </p>
            <p className="font-bold text-xl text-primary">
              {PAYMENT_CONFIG.easypaisa.number}
            </p>
            <p className="text-sm text-muted">{PAYMENT_CONFIG.easypaisa.accountName}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={copyNumber}>
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Number
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EnrollmentFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      fullName: "",
      fatherName: "",
      institution: "",
      classSemester: "",
      cnic: "",
      email: "",
      whatsapp: "",
      fieldOfStudy: "",
      program: undefined,
      level: "",
      learningMode: "online",
      hasLaptop: undefined,
      internetAvailable: undefined,
      confirmInfoCorrect: false,
      agreeToPolicies: false,
    },
  });

  const selectedProgram = watch("program");
  const activeProgram = programs.find((p) => p.slug === selectedProgram);
  const isEnrollable = (slug: string) =>
    ENROLLABLE_PROGRAM_SLUGS.includes(slug as (typeof ENROLLABLE_PROGRAM_SLUGS)[number]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setScreenshotError(null);
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);

    if (!file) {
      setScreenshotFile(null);
      setScreenshotPreview(null);
      return;
    }

    const validationError = validatePaymentScreenshot(file);
    if (validationError) {
      setScreenshotError(validationError);
      setScreenshotFile(null);
      setScreenshotPreview(null);
      return;
    }

    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: EnrollmentFormData) => {
    const fileValidation = validatePaymentScreenshot(screenshotFile ?? undefined);
    if (fileValidation) {
      setScreenshotError(fileValidation);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (screenshotFile) {
        formData.append("paymentScreenshot", screenshotFile);
      }

      const response = await fetch("/api/enrollment", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to submit registration");
      }

      setIsSuccess(true);
      reset();
      setScreenshotFile(null);
      setScreenshotPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section id="enroll" className="section-padding" aria-live="polite">
        <div className="container-custom max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-border bg-background p-10 shadow-sm"
          >
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
            <p className="text-muted mb-6 leading-relaxed">
              Thank you for registering. Our team will verify your payment screenshot
              and contact you on WhatsApp within 2–3 business days.
            </p>
            <Button onClick={() => setIsSuccess(false)}>Submit Another Registration</Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="enroll" className="section-padding section-alt" aria-labelledby="enroll-heading">
      <div className="container-custom max-w-3xl">
        <SectionHeader
          label="Register Now"
          title="Student Registration Form"
          description="The course is completely free. Pay only PKR 1,000 one-time registration to join — all levels ahead are free."
        />

        <PaymentInfoCard />

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 rounded-2xl border border-border bg-background p-6 lg:p-8 space-y-8 shadow-sm"
          noValidate
        >
          <FormSection title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  className="mt-2"
                  {...register("fullName")}
                />
                <FieldError message={errors.fullName?.message} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="fatherName">Father&apos;s Name</Label>
                <Input
                  id="fatherName"
                  placeholder="Father's full name"
                  className="mt-2"
                  {...register("fatherName")}
                />
                <FieldError message={errors.fatherName?.message} />
              </div>

              <div>
                <Label htmlFor="cnic">CNIC (13 digits)</Label>
                <Input
                  id="cnic"
                  inputMode="numeric"
                  placeholder="1234512345678"
                  maxLength={13}
                  className="mt-2"
                  {...register("cnic")}
                />
                <FieldError message={errors.cnic?.message} />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="03001234567"
                  className="mt-2"
                  {...register("whatsapp")}
                />
                <FieldError message={errors.whatsapp?.message} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  className="mt-2"
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Education Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Label htmlFor="institution">School / College / University</Label>
                <Input
                  id="institution"
                  placeholder="Name of your institution"
                  className="mt-2"
                  {...register("institution")}
                />
                <FieldError message={errors.institution?.message} />
              </div>

              <div>
                <Label htmlFor="classSemester">Class / Semester</Label>
                <Input
                  id="classSemester"
                  placeholder="e.g. 2nd Semester, Matric, 1st Year"
                  className="mt-2"
                  {...register("classSemester")}
                />
                <FieldError message={errors.classSemester?.message} />
              </div>

              <div>
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  placeholder="e.g. Computer Science, ICS, IT"
                  className="mt-2"
                  {...register("fieldOfStudy")}
                />
                <FieldError message={errors.fieldOfStudy?.message} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Program Selection">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Label htmlFor="program">Program Applying For</Label>
                <Controller
                  name="program"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        if (isEnrollable(value)) {
                          field.onChange(value);
                          setValue("level", "");
                        }
                      }}
                    >
                      <SelectTrigger id="program" className="mt-2">
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => {
                          const enabled = isEnrollable(program.slug);
                          return (
                            <SelectItem
                              key={program.id}
                              value={program.slug}
                              disabled={!enabled}
                              className={!enabled ? "opacity-50" : undefined}
                            >
                              {program.title}
                              {!enabled ? " — Coming Soon" : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.program?.message} />
                <p className="text-xs text-muted mt-1.5">
                  Currently open: Web Development &amp; Mobile App (Flutter) Development
                </p>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="level">Starting Level</Label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!activeProgram || !isEnrollable(activeProgram.slug)}
                    >
                      <SelectTrigger id="level" className="mt-2">
                        <SelectValue placeholder="Select starting level" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeProgram?.levels.map((level) => (
                          <SelectItem key={level.name} value={level.name}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.level?.message} />
              </div>

              <div className="sm:col-span-2">
                <Label>Learning Mode</Label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                  <GlobeHemisphereWest size={20} weight="duotone" className="text-primary shrink-0" />
                  <span className="font-medium text-primary">{PAYMENT_CONFIG.learningMode}</span>
                  <span className="text-sm text-muted">— All classes are conducted online</span>
                </div>
                <input type="hidden" {...register("learningMode")} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Resources &amp; Requirements">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Controller
                name="hasLaptop"
                control={control}
                render={({ field }) => (
                  <YesNoField
                    label="Do you have a laptop?"
                    name="hasLaptop"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    error={errors.hasLaptop?.message}
                  />
                )}
              />
              <Controller
                name="internetAvailable"
                control={control}
                render={({ field }) => (
                  <YesNoField
                    label="Internet availability at home?"
                    name="internetAvailable"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    error={errors.internetAvailable?.message}
                  />
                )}
              />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted pt-1">
              <span className="inline-flex items-center gap-1.5">
                <DeviceMobile size={14} weight="duotone" className="text-primary" />
                Laptop required for coding practice
              </span>
              <span className="inline-flex items-center gap-1.5">
                <WifiHigh size={14} weight="duotone" className="text-primary" />
                Stable internet needed for live sessions
              </span>
            </div>
          </FormSection>

          <FormSection title="Payment Verification">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 mb-4">
              <p className="text-sm font-semibold text-emerald-800">
                Remember: Course is FREE — upload proof of your PKR 1,000 registration
                payment only.
              </p>
            </div>
            <div>
              <Label htmlFor="paymentScreenshot">
                Registration Payment Screenshot — PKR{" "}
                {PAYMENT_CONFIG.registrationFee.toLocaleString()} only
              </Label>
              <p className="text-xs text-muted mt-1 mb-2">
                Upload a clear screenshot of your Easypaisa payment to{" "}
                <strong>{PAYMENT_CONFIG.easypaisa.number}</strong> (
                {PAYMENT_CONFIG.easypaisa.accountName})
              </p>
              <Input
                id="paymentScreenshot"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="mt-1 cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-accent"
                onChange={handleScreenshotChange}
              />
              <FieldError message={screenshotError ?? undefined} />

              {screenshotPreview && (
                <div className="mt-4 relative w-full max-w-xs aspect-[3/4] rounded-lg overflow-hidden border border-border">
                  <Image
                    src={screenshotPreview}
                    alt="Payment screenshot preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="Agreement">
            <div className="space-y-4">
              <Controller
                name="confirmInfoCorrect"
                control={control}
                render={({ field }) => (
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all duration-200",
                      field.value
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-secondary"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm leading-relaxed text-foreground">
                      I confirm that all information provided is correct.
                    </span>
                  </label>
                )}
              />
              <FieldError message={errors.confirmInfoCorrect?.message} />

              <Controller
                name="agreeToPolicies"
                control={control}
                render={({ field }) => (
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all duration-200",
                      field.value
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-secondary"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm leading-relaxed text-foreground">
                      I agree to follow the rules, attendance policy, and code of conduct
                      of Emerging Edge School of Technology.
                    </span>
                  </label>
                )}
              />
              <FieldError message={errors.agreeToPolicies?.message} />
            </div>
          </FormSection>

          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                Submitting Registration...
              </>
            ) : (
              "Submit Registration"
            )}
          </Button>
        </motion.form>
      </div>
    </section>
  );
}
