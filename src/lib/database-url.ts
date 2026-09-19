/** Production always uses DATABASE_URL (mongodb+srv). Direct URL is local-dev only. */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const activeUrl =
    process.env.NODE_ENV !== "production" && process.env.DATABASE_URL_DIRECT?.trim()
      ? process.env.DATABASE_URL_DIRECT.trim()
      : url;

  // Add optimal connection pooling parameters for serverless MongoDB Atlas if missing
  if (activeUrl.startsWith("mongodb+srv://") && !activeUrl.includes("maxPoolSize=")) {
    const separator = activeUrl.includes("?") ? "&" : "?";
    return `${activeUrl}${separator}maxPoolSize=15&serverSelectionTimeoutMS=5000`;
  }

  return activeUrl;
}

