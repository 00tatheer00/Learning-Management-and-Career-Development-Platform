export async function revealEnrollmentPassword(enrollmentId: string): Promise<{
  password: string | null;
  error?: string;
}> {
  const res = await fetch("/api/admin/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "revealPassword",
      enrollmentId,
    }),
  });
  const json = await res.json();
  if (!json.success) {
    return {
      password: null,
      error: (json.error as string | undefined) ?? (json.message as string | undefined) ?? "Could not load password",
    };
  }
  return {
    password: (json.data?.password as string | undefined) ?? null,
  };
}

export async function revealStudentPassword(studentId: string): Promise<{
  password: string | null;
  error?: string;
}> {
  const res = await fetch("/api/admin/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "revealPassword",
      studentId,
    }),
  });
  const json = await res.json();
  if (!json.success) {
    return {
      password: null,
      error: (json.error as string | undefined) ?? (json.message as string | undefined) ?? "Could not load password",
    };
  }
  return {
    password: (json.data?.password as string | undefined) ?? null,
  };
}

export function paymentScreenshotHref(enrollmentId: string, mode: "inline" | "redirect" = "inline"): string {
  const params = new URLSearchParams({ enrollmentId });
  if (mode === "redirect") params.set("mode", "redirect");
  return `/api/admin/payment-screenshot?${params.toString()}`;
}
