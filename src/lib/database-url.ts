/** Production always uses DATABASE_URL (mongodb+srv). Direct URL is local-dev only. */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (process.env.NODE_ENV === "production") {
    return url;
  }

  const direct = process.env.DATABASE_URL_DIRECT?.trim();
  if (direct) {
    return direct;
  }

  return url;
}
