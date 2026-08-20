/**
 * Validates whether a given string is a safe, well-formed HTTP/HTTPS URL for assignment submissions.
 * Blocks dangerous schemes (e.g. javascript:, data:, file:, vbscript:), control characters, and malformed domains.
 */
export function isValidSubmissionUrl(urlStr: string | null | undefined): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim();
  if (!trimmed || trimmed.length > 2048) return false;

  try {
    const parsed = new URL(trimmed);
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    // Hostname must be non-empty and contain at least one dot or be localhost
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname || hostname.length < 3) return false;

    // Disallow IP ranges with credentials or strange symbols
    if (parsed.username || parsed.password) return false;

    // Check valid hostname characters (alphanumeric, dots, hyphens)
    const validHostRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$|^localhost$/i;
    if (!validHostRegex.test(hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes and normalizes a submission URL. Returns null if the URL is invalid.
 */
export function sanitizeSubmissionUrl(urlStr: string | null | undefined): string | null {
  if (!isValidSubmissionUrl(urlStr)) return null;
  return urlStr!.trim();
}
