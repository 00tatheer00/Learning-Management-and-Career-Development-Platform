import { NextResponse } from "next/server";
import { requireAdminRead, isNextResponse } from "@/lib/auth/admin-access";
import { getWhatsAppCloudConfig } from "@/lib/whatsapp/config";
import { graphWhatsAppFetch } from "@/lib/whatsapp/cloud-api/graph";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdminRead(request);
  if (isNextResponse(user)) return user;

  const { id: mediaId } = await params;
  if (!mediaId) {
    return new Response("Media ID is required", { status: 400 });
  }

  const config = getWhatsAppCloudConfig();
  if (!config) {
    return new Response("WhatsApp is not configured", { status: 503 });
  }

  try {
    // 1. Get the media download URL from Meta Graph API
    const metaRes = await graphWhatsAppFetch<{ url: string; mime_type: string }>(`/${mediaId}`);
    if (!metaRes.ok || !metaRes.data.url) {
      console.error("[whatsapp-media] Failed to fetch media URL from Meta:", metaRes.error);
      return new Response(metaRes.error ?? "Failed to fetch media metadata", { status: 404 });
    }

    const { url: downloadUrl, mime_type: mimeType } = metaRes.data;

    // 2. Download the actual media content using the access token
    const mediaResponse = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
      },
    });

    if (!mediaResponse.ok) {
      console.error(
        "[whatsapp-media] Failed to download media from Facebook CDN:",
        mediaResponse.status,
        mediaResponse.statusText
      );
      return new Response("Failed to download media content", { status: mediaResponse.status });
    }

    // 3. Proxy the binary data back to the client with correct content type
    const buffer = await mediaResponse.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": mimeType || "application/octet-stream",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("[whatsapp-media] Exception in media proxy endpoint:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
