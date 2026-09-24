/**
 * Injects optimal connection pooling and timeout parameters for serverless MongoDB Atlas
 * to avoid connection spikes and hanging requests in production (Vercel).
 */
export function formatDatabaseUrlWithPooling(
  rawUrl: string,
  options: {
    maxPoolSize?: number;
    minPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    connectTimeoutMS?: number;
  } = {}
): string {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl;

  const trimmed = rawUrl.trim();
  const isMongo = trimmed.startsWith("mongodb+srv://") || trimmed.startsWith("mongodb://");
  if (!isMongo) return trimmed;

  const defaultMaxPool = options.maxPoolSize ?? 10;
  const defaultMinPool = options.minPoolSize ?? 0;
  const defaultTimeout = options.serverSelectionTimeoutMS ?? 5000;
  const defaultConnectTimeout = options.connectTimeoutMS ?? 10000;

  const [baseUrl, queryStr = ""] = trimmed.split("?");
  const params = new URLSearchParams(queryStr);

  if (!params.has("maxPoolSize")) {
    params.set("maxPoolSize", String(defaultMaxPool));
  }
  if (!params.has("minPoolSize")) {
    params.set("minPoolSize", String(defaultMinPool));
  }
  if (!params.has("serverSelectionTimeoutMS")) {
    params.set("serverSelectionTimeoutMS", String(defaultTimeout));
  }
  if (!params.has("connectTimeoutMS")) {
    params.set("connectTimeoutMS", String(defaultConnectTimeout));
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

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

  return formatDatabaseUrlWithPooling(activeUrl, { maxPoolSize: 10 });
}
