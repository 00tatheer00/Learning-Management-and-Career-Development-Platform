import crypto from "crypto";

function cleanEnv(val?: string | null): string {
  if (!val) return "";
  return val
    .trim()
    .replace(/^["'\\]+|["'\\]+$/g, "")
    .replace(/^["']+|["']+$/g, "")
    .trim();
}

export function getBunnyConfig() {
  const libraryId = cleanEnv(process.env.BUNNY_STREAM_LIBRARY_ID);
  const apiKey = cleanEnv(process.env.BUNNY_STREAM_API_KEY);
  const tokenKey = cleanEnv(process.env.BUNNY_STREAM_TOKEN_KEY);

  if (!libraryId || !apiKey) {
    throw new Error("Bunny Stream library ID or API Key is not configured. Check your env variables.");
  }
  return {
    libraryId,
    apiKey,
    tokenKey,
  };
}

/**
 * Creates a video placeholder in the Bunny Stream library and returns the video ID.
 */
export async function createBunnyVideo(title: string): Promise<string> {
  const { libraryId, apiKey } = getBunnyConfig();
  const url = `https://video.bunnycdn.com/library/${libraryId}/videos`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create video placeholder in Bunny Stream: ${response.status}. Details: ${errorText}`);
  }

  const data = await response.json();
  if (!data.guid) {
    throw new Error("Bunny Stream did not return a video GUID in response.");
  }

  return data.guid;
}

/**
 * Uploads the raw video file buffer into the created Bunny Stream video entry.
 */
export async function uploadBunnyVideo(videoId: string, fileBuffer: Buffer): Promise<boolean> {
  const { libraryId, apiKey } = getBunnyConfig();
  const url = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload video binary to Bunny Stream: ${response.status}. Details: ${errorText}`);
  }

  return true;
}

/**
 * Deletes a video from Bunny Stream using its video ID.
 */
export async function deleteBunnyVideo(videoId: string): Promise<boolean> {
  const { libraryId, apiKey } = getBunnyConfig();
  const url = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      AccessKey: apiKey,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) return true; // Already deleted
    const errorText = await response.text();
    throw new Error(`Failed to delete video from Bunny Stream: ${response.status}. Details: ${errorText}`);
  }

  return true;
}

/**
 * Fetches real-time video details and transcoding status from Bunny Stream.
 */
export interface BunnyVideoDetails {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number; // Duration in seconds
  status: number; // 0: Created, 1: Uploaded, 2: Processing, 3: Transcoding, 4: Finished, 5: Error
  framerate: number;
  rotation: number | null;
  width: number;
  height: number;
  availableResolutions: string | null;
  thumbnailCount: number;
  encodeProgress: number; // 0 - 100%
  storageSize: number;
  thumbnailUrl: string | null;
}

export async function getBunnyVideoDetails(videoId: string): Promise<BunnyVideoDetails | null> {
  try {
    const { libraryId, apiKey } = getBunnyConfig();
    const url = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        AccessKey: apiKey,
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const errorText = await response.text();
      console.error(`Failed to get video details from Bunny Stream: ${response.status}`, errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getBunnyVideoDetails:", error);
    return null;
  }
}

/**
 * Generates a secure, signed token-authenticated playback iframe URL.
 */
export function generateBunnyEmbedUrl(videoId: string, expirationInSeconds: number = 86400): string {
  const { libraryId, tokenKey } = getBunnyConfig();
  if (!tokenKey) {
    throw new Error("BUNNY_STREAM_TOKEN_KEY is required to generate secure playback URLs.");
  }

  // expiration: Unix timestamp (in seconds) - 24 hour default validity
  const expires = Math.floor(Date.now() / 1000) + expirationInSeconds;
  const stringToHash = tokenKey + videoId + expires;

  const token = crypto
    .createHash("sha256")
    .update(stringToHash)
    .digest("hex");

  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}&autoplay=true`;
}
