"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { GlobeHemisphereWest, DeviceMobile, WifiHigh, Clock, CalendarDots } from "@phosphor-icons/react";
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
import { preparePaymentScreenshot } from "@/lib/utils/payment-screenshot";
import { PAYMENT_CONFIG, ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { PaymentInfoCard } from "@/components/shared/payment-info-card";
import { programs, formatModuleSchedule } from "@/lib/data/programs";
import type { ProgramModule } from "@/types";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/lib/ui/toast";

function RequiredLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      <span className="ml-0.5 text-red-600" aria-hidden="true">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </Label>
  );
}

function EnrollmentModulePicker({
  modules,
  value,
  onChange,
  disabled,
}: {
  modules: ProgramModule[];
  value: string;
  onChange: (moduleName: string) => void;
  disabled?: boolean;
}) {
  if (modules.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted">Select a program first to see available modules.</p>
    );
  }

  return (
    <div className="mt-3 space-y-3" role="radiogroup" aria-label="Starting module">
      {modules.map((mod, index) => {
        const isSelected = value === mod.name;

        return (
          <button
            key={mod.name}
            type="button"
            disabled={disabled}
            onClick={() => onChange(mod.name)}
            className={cn(
              "w-full rounded-xl border p-4 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                : "border-border bg-background hover:border-primary/30 hover:bg-surface/50"
            )}
            role="radio"
            aria-checked={isSelected}
          >
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Module {index + 1}
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">{mod.name}</p>
                {mod.subtitle && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{mod.subtitle}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/80 px-2.5 py-1 text-xs font-medium text-muted">
                    <Clock size={14} weight="duotone" className="text-primary" aria-hidden="true" />
                    Duration: {mod.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/80 px-2.5 py-1 text-xs font-medium text-muted">
                    <CalendarDots size={14} weight="duotone" className="text-primary" aria-hidden="true" />
                    {formatModuleSchedule(mod)}
                  </span>
                </div>
              </div>

              {isSelected && (
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

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
      <Label>
        {label}
        <span className="ml-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      </Label>
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

interface EnrollmentFormProps {
  defaultProgram?: string;
}

export function EnrollmentForm({ defaultProgram }: EnrollmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedApplicationNumber, setSubmittedApplicationNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [applicantHistory, setApplicantHistory] = useState<{
    applicationNumber: number;
    previousApplications: Array<{
      courseTitle: string;
      level: string;
      status: string;
      appliedAt: string;
    }>;
    isReturningApplicant: boolean;
  } | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isSuccess) return;

    const scrollToForm = () => {
      const target = document.getElementById("register-form");
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    scrollToForm();
    const timer = window.setTimeout(scrollToForm, 150);
    return () => window.clearTimeout(timer);
  }, [isSuccess]);

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
  const watchedEmail = watch("email");
  const watchedCnic = watch("cnic");
  const activeProgram = programs.find((p) => p.slug === selectedProgram);
  const isEnrollable = (slug: string) =>
    ENROLLABLE_PROGRAM_SLUGS.includes(slug as (typeof ENROLLABLE_PROGRAM_SLUGS)[number]);

  useEffect(() => {
    if (defaultProgram && isEnrollable(defaultProgram)) {
      setValue("program", defaultProgram as EnrollmentFormData["program"]);
    }
  }, [defaultProgram, setValue]);

  useEffect(() => {
    const email = watchedEmail?.trim().toLowerCase() ?? "";
    const cnic = watchedCnic?.replace(/[-\s]/g, "") ?? "";

    if (!email.includes("@") || cnic.length !== 13) {
      setApplicantHistory(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      setHistoryLoading(true);
      try {
        const params = new URLSearchParams({ email, cnic });
        const res = await fetch(`/api/enrollment/history?${params.toString()}`);
        const json = await res.json();
        if (json.success && json.data) {
          setApplicantHistory(json.data);
        } else {
          setApplicantHistory(null);
        }
      } catch {
        setApplicantHistory(null);
      } finally {
        setHistoryLoading(false);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [watchedEmail, watchedCnic]);

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

  const scrollToFirstError = (formErrors: FieldErrors<EnrollmentFormData>) => {
    const orderedFields: (keyof EnrollmentFormData | "paymentScreenshot")[] = [
      "fullName",
      "fatherName",
      "cnic",
      "whatsapp",
      "email",
      "institution",
      "classSemester",
      "fieldOfStudy",
      "program",
      "level",
      "hasLaptop",
      "internetAvailable",
      "paymentScreenshot",
      "confirmInfoCorrect",
      "agreeToPolicies",
    ];

    for (const field of orderedFields) {
      if (field === "paymentScreenshot") {
        if (screenshotError) {
          document
            .getElementById("paymentScreenshot")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        continue;
      }
      if (formErrors[field]) {
        const target =
          document.getElementById(String(field)) ??
          document.querySelector(`[name="${String(field)}"]`);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
  };

  const onInvalid = (formErrors: FieldErrors<EnrollmentFormData>) => {
    if (!screenshotFile) {
      setScreenshotError("Please upload your Easypaisa payment screenshot");
    }
    scrollToFirstError(formErrors);
    toast.error("Please complete all required fields", "Scroll up to see highlighted errors.");
  };

  const onSubmit = async (data: EnrollmentFormData) => {
    const fileValidation = validatePaymentScreenshot(screenshotFile ?? undefined);
    if (fileValidation) {
      setScreenshotError(fileValidation);
      toast.error("Payment screenshot required", fileValidation);
      document.getElementById("paymentScreenshot")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const uploadFile = await preparePaymentScreenshot(screenshotFile!);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      formData.append("paymentScreenshot", uploadFile);

      const response = await fetch("/api/enrollment", {
        method: "POST",
        body: formData,
      });

      let result: {
        success?: boolean;
        message?: string;
        error?: string;
        data?: { applicationNumber?: number; isReturningApplicant?: boolean };
      } = {};
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else if (response.status === 413) {
        throw new Error(
          "Screenshot is too large for upload. Please use a smaller image under 4MB."
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            (response.status === 413
              ? "Screenshot is too large. Please use an image under 4MB."
              : "Failed to submit registration")
        );
      }

      setSubmittedApplicationNumber(result.data?.applicationNumber ?? 1);
      setIsSuccess(true);
      toast.success(
        result.data?.applicationNumber && result.data.applicationNumber > 1
          ? `Application #${result.data.applicationNumber} submitted!`
          : "Registration submitted!",
        result.message ?? "We will verify your payment and contact you within 2–3 business days."
      );
      reset();
      setApplicantHistory(null);
      setScreenshotFile(null);
      setScreenshotPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error("Registration failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        id="register-form-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-border bg-background p-8 lg:p-10 shadow-sm text-center min-h-[320px] flex flex-col items-center justify-center"
        aria-live="polite"
        tabIndex={-1}
      >
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-2xl font-bold mb-2">
          {submittedApplicationNumber > 1
            ? `Application #${submittedApplicationNumber} Submitted!`
            : "Registration Submitted!"}
        </h2>
        <p className="text-muted mb-6 leading-relaxed max-w-md mx-auto">
          Thank you for registering
          {submittedApplicationNumber > 1 ? " again" : ""}. Our team will verify your{" "}
          <strong>new payment screenshot</strong> within 2–3 business days. Once approved, your
          portal login details will be sent to your <strong>WhatsApp</strong>.
        </p>
        <Button onClick={() => setIsSuccess(false)}>Submit Another Registration</Button>
      </motion.div>
    );
  }

  return (
    <div id="register-form-panel">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
          Registration Form
        </p>
        <h2 id="register-heading" className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Complete Your Application
        </h2>
        <p className="text-muted leading-relaxed">
          Fill in your details below and upload your PKR 1,000 registration payment
          screenshot to secure your seat. Fields marked with{" "}
          <span className="text-red-600 font-medium">*</span> are required.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="rounded-2xl border border-border bg-background p-6 lg:p-8 space-y-8 shadow-sm"
        noValidate
      >
          <FormSection title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <RequiredLabel htmlFor="fullName">Full Name</RequiredLabel>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  className="mt-2"
                  required
                  aria-required="true"
                  {...register("fullName")}
                />
                <FieldError message={errors.fullName?.message} />
              </div>

              <div className="sm:col-span-2">
                <RequiredLabel htmlFor="fatherName">Father&apos;s Name</RequiredLabel>
                <Input
                  id="fatherName"
                  placeholder="Father's full name"
                  className="mt-2"
                  required
                  aria-required="true"
                  {...register("fatherName")}
                />
                <FieldError message={errors.fatherName?.message} />
              </div>

              <div>
                <RequiredLabel htmlFor="cnic">CNIC (13 digits)</RequiredLabel>
                <Input
                  id="cnic"
                  inputMode="numeric"
                  placeholder="1234512345678"
                  maxLength={13}
                  className="mt-2"
                  required
                  aria-required="true"
                  {...register("cnic")}
                />
                <FieldError message={errors.cnic?.message} />
              </div>

              <div>
                <RequiredLabel htmlFor="whatsapp">WhatsApp Number</RequiredLabel>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="03001234567"
                  className="mt-2"
                  required
                  aria-required="true"
                  {...register("whatsapp")}
                />
                <FieldError message={errors.whatsapp?.message} />
              </div>

              <div className="sm:col-span-2">
                <RequiredLabel htmlFor="email">Email Address</RequiredLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  className="mt-2"
                  required
                  aria-required="true"
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>
            </div>

            {applicantHistory?.isReturningApplicant && (
              <Alert
                variant="info"
                title={`Welcome back — application #${applicantHistory.applicationNumber}`}
              >
                <p className="mb-2">
                  You can register for <strong>another course or module</strong> anytime. Each
                  registration needs its own <strong>PKR 1,000</strong> payment.
                </p>
                <ul className="mb-3 space-y-1 text-sm">
                  {applicantHistory.previousApplications.map((item) => (
                    <li key={`${item.courseTitle}-${item.appliedAt}`}>
                      • {item.courseTitle} ({item.level}) —{" "}
                      <strong className="capitalize">{item.status}</strong>
                    </li>
                  ))}
                </ul>
                <p className="font-medium">
                  Please complete a <strong>new Easypaisa payment</strong> and upload a fresh
                  screenshot below. Old payment proofs cannot be reused.
                </p>
              </Alert>
            )}

            {historyLoading && (
              <p className="text-xs text-muted">Checking previous applications…</p>
            )}
          </FormSection>

          <FormSection title="Education Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <RequiredLabel htmlFor="institution">School / College / University</RequiredLabel>
                <Input
                  id="institution"
                  placeholder="Name of your institution"
                  className="mt-2"
                  required
                  aria-required="true"
                  {...register("institution")}
                />
                <FieldError message={errors.institution?.message} />
              </div>

              <div>
                <RequiredLabel htmlFor="classSemester">Class / Semester</RequiredLabel>
                <Input
                  id="classSemester"
                  placeholder="e.g. 2nd Semester, Matric, 1st Year"
                  className="mt-2"
                  required
                  aria-required="true"
                  {...register("classSemester")}
                />
                <FieldError message={errors.classSemester?.message} />
              </div>

              <div>
                <RequiredLabel htmlFor="fieldOfStudy">Field of Study</RequiredLabel>
                <Input
                  id="fieldOfStudy"
                  placeholder="e.g. Computer Science, ICS, IT"
                  className="mt-2"
                  required
                  aria-required="true"
                  {...register("fieldOfStudy")}
                />
                <FieldError message={errors.fieldOfStudy?.message} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Program Selection">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <RequiredLabel htmlFor="program">Program Applying For</RequiredLabel>
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
                      <SelectTrigger id="program" className="mt-2" aria-required="true">
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
                <RequiredLabel htmlFor="level">Starting Module</RequiredLabel>
                <p className="mt-1 text-xs text-muted">
                  Har module kya cover karta hai aur kitni duration hai — neeche se apna starting
                  module choose karein.
                </p>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <EnrollmentModulePicker
                      modules={activeProgram?.modules ?? []}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!activeProgram || !isEnrollable(activeProgram.slug)}
                    />
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

            <PaymentInfoCard compact className="mb-5" />

            <div>
              <RequiredLabel htmlFor="paymentScreenshot">
                Upload Payment Screenshot — PKR{" "}
                {PAYMENT_CONFIG.registrationFee.toLocaleString()} only
              </RequiredLabel>
              <p className="text-xs text-muted mt-1 mb-2">
                <strong>Required.</strong> Upload a clear JPG/PNG screenshot after payment. Max size{" "}
                4MB — large phone photos are auto-compressed when possible.
              </p>
              <Input
                id="paymentScreenshot"
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                aria-required="true"
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
                      I confirm that all information provided is correct.{" "}
                      <span className="text-red-600">*</span>
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
                      of Emerging Edge School of Technology.{" "}
                      <span className="text-red-600">*</span>
                    </span>
                  </label>
                )}
              />
              <FieldError message={errors.agreeToPolicies?.message} />
            </div>
          </FormSection>

          {error && (
            <Alert variant="error">{error}</Alert>
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
  );
}
