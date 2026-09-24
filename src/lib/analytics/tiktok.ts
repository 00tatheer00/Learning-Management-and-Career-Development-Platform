/**
 * TikTok Pixel Event Tracking Utilities
 * Handles standard TikTok events, Advanced Matching SHA-256 PII hashing,
 * and client-side deduplication.
 */

export interface TikTokContentItem {
  content_id: string;
  content_type: string;
  content_name: string;
}

export interface TikTokViewContentOptions {
  contentId: string;
  contentName: string;
  contentType?: string;
  value?: number;
  currency?: string;
}

export interface TikTokRegistrationOptions {
  contentId: string;
  contentName: string;
  contentType?: string;
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
  externalId?: string;
}

export interface TikTokContactOptions {
  contentId?: string;
  contentName?: string;
  email?: string;
  phone?: string;
}

export interface TikTokLeadOptions {
  contentId?: string;
  contentName?: string;
  contentType?: string;
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
}

export interface TikTokClickButtonOptions {
  contentId?: string;
  contentName?: string;
  contentType?: string;
  value?: number;
  currency?: string;
}

export interface TikTokAddToWishlistOptions {
  contentId: string;
  contentName: string;
  contentType?: string;
  value?: number;
  currency?: string;
}

export interface TikTokInitiateCheckoutOptions {
  contentId: string;
  contentName: string;
  contentType?: string;
  value?: number;
  currency?: string;
}

export interface TikTokPaymentOptions {
  contentId: string;
  contentName: string;
  contentType?: string;
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
  externalId?: string;
}

export interface TikTokSearchOptions {
  searchQuery: string;
  contentId?: string;
  contentName?: string;
}

export interface TikTokIdentifyData {
  email?: string;
  phone?: string;
  externalId?: string;
}

/**
 * Hashes a string using SHA-256 and returns a 64-character lowercase hex string.
 * Uses native Web Crypto API in browser environments and Node.js.
 */
export async function sha256Hex(value: string): Promise<string> {
  const cryptoObj =
    (typeof window !== "undefined" && window.crypto) ||
    (typeof globalThis !== "undefined" && globalThis.crypto);

  if (!cryptoObj || !cryptoObj.subtle) {
    return "";
  }
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await cryptoObj.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "";
  }
}

/**
 * Normalizes email address according to TikTok Advanced Matching standards:
 * - Trim whitespace
 * - Convert to lowercase
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes phone number into E.164 format (+[country code][digits]):
 * - Strips all non-digit characters
 * - Converts Pakistani numbers starting with 03XX... to +923XX...
 * - Retains leading international country codes
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("92")) {
    return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    return `+92${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("3")) {
    return `+92${digits}`;
  }
  return `+${digits}`;
}

/**
 * Registers hashed user identifiers with ttq.identify() for Advanced Matching.
 * Raw PII is never sent or logged to the console.
 */
export async function trackTikTokIdentify(data: TikTokIdentifyData): Promise<void> {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.identify !== "function") {
    return;
  }

  const payload: Record<string, string> = {};

  if (data.email) {
    const normalizedEmail = normalizeEmail(data.email);
    const hashedEmail = await sha256Hex(normalizedEmail);
    if (hashedEmail) {
      payload.email = hashedEmail;
    }
  }

  if (data.phone) {
    const normalizedPhone = normalizePhone(data.phone);
    const hashedPhone = await sha256Hex(normalizedPhone);
    if (hashedPhone) {
      payload.phone_number = hashedPhone;
    }
  }

  if (data.externalId) {
    const hashedId = await sha256Hex(data.externalId.trim());
    if (hashedId) {
      payload.external_id = hashedId;
    }
  }

  if (Object.keys(payload).length > 0) {
    try {
      window.ttq.identify(payload);
    } catch {
      // Gracefully prevent analytics from breaking app flow
    }
  }
}

/**
 * Tracks ViewContent event when viewing course or program details.
 */
export function trackTikTokViewContent(options: TikTokViewContentOptions): void {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") {
    return;
  }

  try {
    window.ttq.track("ViewContent", {
      contents: [
        {
          content_id: options.contentId,
          content_type: options.contentType || "product",
          content_name: options.contentName,
        },
      ],
      value: options.value ?? 1000,
      currency: options.currency || "PKR",
    });
  } catch {
    // Graceful suppression
  }
}

// In-memory set to prevent multiple triggers in the same JS session / React cycles
const trackedRegistrations = new Set<string>();

/**
 * Tracks CompleteRegistration conversion event after verified server success.
 * Includes deduplication guards to ensure it fires exactly once per application.
 */
export async function trackTikTokCompleteRegistration(
  options: TikTokRegistrationOptions
): Promise<void> {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") {
    return;
  }

  // Deduplication check
  const dedupKey = options.externalId || `${options.contentId}_${options.email || "anon"}`;
  if (trackedRegistrations.has(dedupKey)) {
    return;
  }

  try {
    const storageKey = `tt_reg_done_${dedupKey}`;
    if (sessionStorage.getItem(storageKey)) {
      return;
    }
    sessionStorage.setItem(storageKey, "true");
  } catch {
    // In-memory set continues to protect even if sessionStorage is blocked
  }

  trackedRegistrations.add(dedupKey);

  // Send hashed Advanced Matching identify if PII is available
  if (options.email || options.phone || options.externalId) {
    await trackTikTokIdentify({
      email: options.email,
      phone: options.phone,
      externalId: options.externalId,
    });
  }

  try {
    window.ttq.track("CompleteRegistration", {
      contents: [
        {
          content_id: options.contentId,
          content_type: options.contentType || "product",
          content_name: options.contentName,
        },
      ],
      value: options.value ?? 1000,
      currency: options.currency || "PKR",
    });
  } catch {
    // Graceful suppression
  }
}

/**
 * Tracks Contact event upon successful contact inquiry submission.
 */
export async function trackTikTokContact(options?: TikTokContactOptions): Promise<void> {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") {
    return;
  }

  if (options?.email || options?.phone) {
    await trackTikTokIdentify({
      email: options.email,
      phone: options.phone,
    });
  }

  try {
    window.ttq.track("Contact", {
      contents: [
        {
          content_id: options?.contentId || "contact_inquiry",
          content_type: "product",
          content_name: options?.contentName || "Contact Inquiry",
        },
      ],
      value: 0,
      currency: "PKR",
    });
  } catch {
    // Graceful suppression
  }
}

/**
 * Tracks Lead event.
 */
export async function trackTikTokLead(options?: TikTokLeadOptions): Promise<void> {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") {
    return;
  }

  if (options?.email || options?.phone) {
    await trackTikTokIdentify({
      email: options.email,
      phone: options.phone,
    });
  }

  try {
    window.ttq.track("Lead", {
      contents: [
        {
          content_id: options?.contentId || "lead_capture",
          content_type: options?.contentType || "product",
          content_name: options?.contentName || "Lead",
        },
      ],
      value: options?.value ?? 0,
      currency: options?.currency || "PKR",
    });
  } catch {
    // Graceful suppression
  }
}

/**
 * Tracks ClickButton event when interactive CTA buttons are clicked.
 */
export function trackTikTokClickButton(options?: TikTokClickButtonOptions): void {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") {
    return;
  }

  try {
    window.ttq.track("ClickButton", {
      contents: [
        {
          content_id: options?.contentId || "cta_button",
          content_type: options?.contentType || "product",
          content_name: options?.contentName || "Button Click",
        },
      ],
      value: options?.value ?? 0,
      currency: options?.currency || "PKR",
    });
  } catch {
    // Graceful suppression
  }
}

/**
 * Tracks AddToWishlist event when bookmarking or saving courses.
 */
export function trackTikTokAddToWishlist(options: TikTokAddToWishlistOptions): void {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") {
    return;
  }

  try {
    window.ttq.track("AddToWishlist", {
      contents: [
        {
          content_id: options.contentId,
          content_type: options.contentType || "product",
          content_name: options.contentName,
        },
      ],
      value: options.value ?? 0,
      currency: options.currency || "PKR",
    });
  } catch {
    // Graceful suppression
  }
}

/**
 * Tracks InitiateCheckout event when student begins enrollment / registration checkout flow.
 */
export function trackTikTokInitiateCheckout(options: TikTokInitiateCheckoutOptions): void {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") {
    return;
  }

  try {
    window.ttq.track("InitiateCheckout", {
      contents: [
        {
          content_id: options.contentId,
          content_type: options.contentType || "product",
          content_name: options.contentName,
        },
      ],
      value: options.value ?? 1000,
      currency: options.currency || "PKR",
    });
  } catch {
    // Graceful suppression
  }
}

/**
 * Tracks CompletePayment event upon verified payment / registration fee confirmation.
 */
export async function trackTikTokPayment(options: TikTokPaymentOptions): Promise<void> {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") {
    return;
  }

  if (options.email || options.phone || options.externalId) {
    await trackTikTokIdentify({
      email: options.email,
      phone: options.phone,
      externalId: options.externalId,
    });
  }

  try {
    window.ttq.track("CompletePayment", {
      contents: [
        {
          content_id: options.contentId,
          content_type: options.contentType || "product",
          content_name: options.contentName,
        },
      ],
      value: options.value ?? 1000,
      currency: options.currency || "PKR",
    });
  } catch {
    // Graceful suppression
  }
}

/**
 * Tracks Search event.
 */
export function trackTikTokSearch(options: TikTokSearchOptions): void {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") {
    return;
  }

  try {
    window.ttq.track("Search", {
      contents: [
        {
          content_id: options.contentId || "search",
          content_type: "product",
          content_name: options.contentName || "Search",
        },
      ],
      value: 0,
      currency: "PKR",
      search_string: options.searchQuery,
    });
  } catch {
    // Graceful suppression
  }
}
