"use client";

import { useEffect, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { EnrollmentFormData } from "@/lib/validations/enrollment";
import { DRAFT_STORAGE_KEY } from "./enrollment-utils";
import { toast } from "@/lib/ui/toast";

export function useEnrollmentDraft(form: UseFormReturn<EnrollmentFormData>) {
  // Restore draft on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([key, val]) => {
              form.setValue(
                key as keyof EnrollmentFormData,
                val as unknown as EnrollmentFormData[keyof EnrollmentFormData]
              );
          });
          toast.info("Restored your registration draft");
        }
      }
    } catch {
      // Ignore storage read error
    }
  }, [form]);

  // Auto-save form values when inputs change
  const saveDraft = useCallback(
    (values: Partial<EnrollmentFormData>) => {
      try {
        const draftData = {
          fullName: values.fullName ?? "",
          fatherName: values.fatherName ?? "",
          cnic: values.cnic ?? "",
          whatsapp: values.whatsapp ?? "",
          email: values.email ?? "",
          institution: values.institution ?? "",
          classSemester: values.classSemester ?? "",
          fieldOfStudy: values.fieldOfStudy ?? "",
          program: values.program ?? "",
          level: values.level ?? "",
          hasLaptop: values.hasLaptop ?? "",
          internetAvailable: values.internetAvailable ?? "",
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      } catch {
        // Ignore storage write error
      }
    },
    []
  );

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage clear error
    }
  }, []);

  return { saveDraft, clearDraft };
}
