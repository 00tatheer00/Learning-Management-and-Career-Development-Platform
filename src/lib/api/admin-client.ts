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

export function paymentScreenshotHref(enrollmentId: string): string {
  return `/api/admin/payment-screenshot?enrollmentId=${encodeURIComponent(enrollmentId)}`;
}
