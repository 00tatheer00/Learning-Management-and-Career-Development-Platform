import fs from "fs";
import path from "path";
import sharp from "sharp";

export interface CertificateRenderInput {
  studentName: string;
  moduleName: string;
  programTitle: string;
  completionDate: string;
  certificateId: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const MASTER_TEMPLATE_PATH = path.join(process.cwd(), "public/certificates/certificate-master-template.png");

// Preload Base64 TTF fonts for Sharp / librsvg rendering on Linux & Vercel
let fontDefsStyle = "";
try {
  const alexBrushPath = path.join(process.cwd(), "public/fonts/AlexBrush-Regular.ttf");
  const gVibesPath = path.join(process.cwd(), "public/fonts/GreatVibes-Regular.ttf");
  const cinzelPath = path.join(process.cwd(), "public/fonts/Cinzel-Bold.ttf");
  const interRegPath = path.join(process.cwd(), "public/fonts/Inter-Regular.ttf");
  const interBoldPath = path.join(process.cwd(), "public/fonts/Inter-Bold.ttf");

  const b64AlexBrush = fs.readFileSync(alexBrushPath).toString("base64");
  const b64GreatVibes = fs.readFileSync(gVibesPath).toString("base64");
  const b64Cinzel = fs.readFileSync(cinzelPath).toString("base64");
  const b64InterReg = fs.readFileSync(interRegPath).toString("base64");
  const b64InterBold = fs.readFileSync(interBoldPath).toString("base64");

  fontDefsStyle = `
    @font-face {
      font-family: 'CertAlexBrush';
      src: url('data:font/ttf;charset=utf-8;base64,${b64AlexBrush}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'CertGreatVibes';
      src: url('data:font/ttf;charset=utf-8;base64,${b64GreatVibes}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'CertCinzel';
      src: url('data:font/ttf;charset=utf-8;base64,${b64Cinzel}') format('truetype');
      font-weight: bold;
      font-style: normal;
    }
    @font-face {
      font-family: 'CertInter';
      src: url('data:font/ttf;charset=utf-8;base64,${b64InterReg}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'CertInterBold';
      src: url('data:font/ttf;charset=utf-8;base64,${b64InterBold}') format('truetype');
      font-weight: bold;
      font-style: normal;
    }
  `;
} catch (err) {
  console.error("Warning: Failed to preload embedded TTF fonts for SVG rendering:", err);
}

export function buildMasterCertificateOverlaySvg(input: CertificateRenderInput): string {
  const width = 1024;
  const height = 682;

  const name = escapeXml(input.studentName);
  const moduleName = escapeXml(input.moduleName);
  const programTitle = escapeXml(input.programTitle);
  const date = escapeXml(input.completionDate);
  const certId = escapeXml(input.certificateId);

  const nameLen = input.studentName.length;
  const nameFontSize = nameLen > 32 ? 38 : nameLen > 24 ? 46 : nameLen > 18 ? 54 : 64;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css">
      ${fontDefsStyle}
    </style>
  </defs>

  <!-- Dynamic Text Overlays on Pristine Master Artwork Background -->
  <!-- 1. Student Name (Centered Calligraphy Cursive) -->
  <text x="585" y="340" text-anchor="middle" font-family="CertAlexBrush, CertGreatVibes, cursive" font-size="${nameFontSize}" fill="#0D1117">${name}</text>

  <!-- 2. Module Name (Orange Bold Text) -->
  <text x="515" y="398" font-family="CertInterBold, sans-serif" font-size="13" font-weight="bold" fill="#EA580C">[ ${moduleName} ]</text>

  <!-- 3. Course Name (Orange Bold Text) -->
  <text x="515" y="422" font-family="CertInterBold, sans-serif" font-size="13" font-weight="bold" fill="#EA580C">[ ${programTitle} ]</text>

  <!-- 4. Date of Completion -->
  <text x="286" y="556" text-anchor="middle" font-family="CertInterBold, sans-serif" font-size="11.5" font-weight="bold" fill="#262626">${date}</text>

  <!-- 5. Verification Code -->
  <text x="478" y="633" text-anchor="middle" font-family="CertInterBold, monospace" font-size="12.5" font-weight="bold" fill="#C2410C" letter-spacing="0.5">${certId}</text>

  <!-- 6. Verification URL -->
  <text x="586" y="638" font-family="CertInterBold, sans-serif" font-size="10" font-weight="bold" fill="#EA580C">schoolemergingedge.tech/verify</text>
</svg>`;
}

export async function renderCertificatePng(input: CertificateRenderInput): Promise<Buffer> {
  const overlaySvg = buildMasterCertificateOverlaySvg(input);

  return sharp(MASTER_TEMPLATE_PATH)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png({ quality: 100, compressionLevel: 6 })
    .toBuffer();
}
