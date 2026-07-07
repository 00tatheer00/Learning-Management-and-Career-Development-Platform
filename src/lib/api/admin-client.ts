export async function revealStudentPassword(studentId: string): Promise<string | null> {
  const res = await fetch("/api/admin/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "revealPassword", studentId }),
  });
  const json = await res.json();
  if (!json.success) return null;
  return (json.data?.password as string | undefined) ?? null;
}

export function paymentScreenshotHref(enrollmentId: string, mode: "inline" | "redirect" = "inline"): string {
  const params = new URLSearchParams({ enrollmentId });
  if (mode === "redirect") params.set("mode", "redirect");
  return `/api/admin/payment-screenshot?${params.toString()}`;
}
