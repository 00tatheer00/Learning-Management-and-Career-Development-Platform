const MAX_PAYMENT_SCREENSHOT_BYTES = 4 * 1024 * 1024;
const COMPRESS_THRESHOLD_BYTES = 1.25 * 1024 * 1024;

const IMAGE_EXTENSION_RE = /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i;

export function normalizeWhatsappNumber(raw: string): string {
  let value = raw.replace(/[\s\-()+]/g, "");
  if (value.startsWith("+92")) value = value.slice(3);
  if (value.startsWith("92") && value.length === 12) value = value.slice(2);
  if (value.startsWith("0092") && value.length === 14) value = value.slice(4);
  return value;
}

export function normalizeCnic(raw: string): string {
  return raw.replace(/[-\s]/g, "");
}

export function isPaymentScreenshotImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return IMAGE_EXTENSION_RE.test(file.name);
}

export function validatePaymentScreenshot(file: File | undefined): string | null {
  if (!file || file.size === 0) {
    return "Please upload your Easypaisa payment screenshot";
  }
  if (!isPaymentScreenshotImage(file)) {
    return "Screenshot must be an image (JPG, PNG, etc.). If you use iPhone, try saving as JPG or take a new screenshot.";
  }
  if (file.size > MAX_PAYMENT_SCREENSHOT_BYTES) {
    return "Screenshot is too large. Please use an image under 4MB (take a new screenshot or compress it).";
  }
  return null;
}

function canCompressInBrowser(file: File): boolean {
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp" ||
    /\.(jpe?g|png|webp)$/i.test(file.name)
  );
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    image.src = url;
  });
}

export async function preparePaymentScreenshot(file: File): Promise<File> {
  const validationError = validatePaymentScreenshot(file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (file.size <= COMPRESS_THRESHOLD_BYTES || !canCompressInBrowser(file)) {
    return file;
  }

  try {
    const image = await loadImageFromFile(file);
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82)
    );

    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "payment-screenshot";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export { MAX_PAYMENT_SCREENSHOT_BYTES };
