import { getWhatsAppCloudConfig, getWhatsAppGraphBaseUrl } from "@/lib/whatsapp/config";

export interface GraphErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

export async function graphWhatsAppFetch<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T; error?: string }> {
  const config = getWhatsAppCloudConfig();
  if (!config) {
    return { ok: false, status: 503, data: {} as T, error: "WhatsApp Cloud API is not configured" };
  }

  const url = `${getWhatsAppGraphBaseUrl(config.apiVersion)}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  let data: T & GraphErrorBody;
  try {
    data = (await response.json()) as T & GraphErrorBody;
  } catch {
    return {
      ok: false,
      status: response.status,
      data: {} as T,
      error: "Invalid response from Meta Graph API",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: data as T,
      error: data.error?.message ?? `Graph API request failed (${response.status})`,
    };
  }

  return { ok: true, status: response.status, data: data as T };
}
