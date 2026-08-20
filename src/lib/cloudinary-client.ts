export interface DirectUploadResult {
  url: string;
  publicId: string;
}

export interface DirectUploadOptions {
  folder?: string;
  publicId?: string;
  onProgress?: (percent: number) => void;
}

/**
 * Directly upload an image file from the browser to Cloudinary using a secure server-generated signature.
 * This completely avoids routing heavy payloads through Next.js serverless functions.
 */
export async function uploadDirectToCloudinary(
  file: File,
  options: DirectUploadOptions = {}
): Promise<DirectUploadResult> {
  const { folder = "eest/payment-screenshots", publicId, onProgress } = options;

  // 1. Fetch signature from API
  const signRes = await fetch("/api/uploads/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, publicId }),
  });

  if (!signRes.ok) {
    const errorJson = await signRes.json().catch(() => ({}));
    throw new Error(errorJson?.error || "Could not generate upload signature.");
  }

  const signData = await signRes.json();
  if (!signData.success || !signData.data) {
    throw new Error(signData.error || "Failed to authorize upload.");
  }

  const { signature, timestamp, apiKey, cloudName, transformation } = signData.data;

  // 2. Prepare FormData for direct Cloudinary upload endpoint
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);
  if (transformation) {
    formData.append("transformation", transformation);
  }
  if (signData.data.publicId) {
    formData.append("public_id", signData.data.publicId);
  }

  // 3. Upload via XMLHttpRequest to get accurate upload progress
  return new Promise<DirectUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    xhr.open("POST", uploadUrl, true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url || response.url,
            publicId: response.public_id,
          });
        } catch {
          reject(new Error("Failed to parse Cloudinary response."));
        }
      } else {
        try {
          const errorResp = JSON.parse(xhr.responseText);
          reject(new Error(errorResp?.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during direct Cloudinary upload."));
    };

    xhr.send(formData);
  });
}
