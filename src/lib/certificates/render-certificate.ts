import fs from "fs";
import path from "path";
import opentype from "opentype.js";
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

// Preload opentype font for vector calligraphy rendering
let scriptFont: opentype.Font | null = null;
try {
  const fontPath = path.join(process.cwd(), "public/fonts/AlexBrush-Regular.ttf");
  const fontBuffer = fs.readFileSync(fontPath);
  scriptFont = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));
} catch (err) {
  console.error("Warning: Failed to load script font for opentype rendering:", err);
}

// Preload Base64 TTF fonts for Sharp / librsvg rendering
let fontDefsStyle = "";
try {
  const cinzelPath = path.join(process.cwd(), "public/fonts/Cinzel-Bold.ttf");
  const interRegPath = path.join(process.cwd(), "public/fonts/Inter-Regular.ttf");
  const interBoldPath = path.join(process.cwd(), "public/fonts/Inter-Bold.ttf");

  const b64Cinzel = fs.readFileSync(cinzelPath).toString("base64");
  const b64InterReg = fs.readFileSync(interRegPath).toString("base64");
  const b64InterBold = fs.readFileSync(interBoldPath).toString("base64");

  fontDefsStyle = `
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

  // Clean brackets from raw input if present
  const cleanModuleName = escapeXml(input.moduleName.replace(/^\[\s*/, "").replace(/\s*\]$/, ""));
  const cleanProgramTitle = escapeXml(input.programTitle.replace(/^\[\s*/, "").replace(/\s*\]$/, ""));
  const date = escapeXml(input.completionDate);
  const certId = escapeXml(input.certificateId);

  // Student Name Calligraphy Vector Path Generation
  const rawName = input.studentName.trim();
  const nameLen = rawName.length;
  const nameFontSize = nameLen > 32 ? 38 : nameLen > 24 ? 46 : nameLen > 18 ? 54 : 64;

  let nameSvgElement = "";
  if (scriptFont) {
    try {
      const bbox = scriptFont.getPath(rawName, 0, 0, nameFontSize).getBoundingBox();
      const textWidth = bbox.x2 - bbox.x1;
      const targetX = 585 - textWidth / 2;
      const targetY = 338;
      const pathData = scriptFont.getPath(rawName, targetX, targetY, nameFontSize).toSVG(4);
      nameSvgElement = `<g fill="#0D1117">${pathData}</g>`;
    } catch {
      nameSvgElement = `<text x="585" y="338" text-anchor="middle" font-family="'Georgia', serif" font-size="${nameFontSize}" fill="#0D1117">${escapeXml(rawName)}</text>`;
    }
  } else {
    nameSvgElement = `<text x="585" y="338" text-anchor="middle" font-family="'Georgia', serif" font-size="${nameFontSize}" fill="#0D1117">${escapeXml(rawName)}</text>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css">
      ${fontDefsStyle}
    </style>
  </defs>

  <!-- 1. Student Name (Centered Vector Calligraphy Script) -->
  ${nameSvgElement}

  <!-- 2. Module Name (Orange Bold Text without brackets, aligned right after "has successfully completed the") -->
  <text x="574" y="394" font-family="CertInterBold, sans-serif" font-size="13" font-weight="bold" fill="#EA580C">${cleanModuleName}</text>

  <!-- 3. Course Name (Orange Bold Text without brackets, aligned right after "as part of the") -->
  <text x="520" y="418" font-family="CertInterBold, sans-serif" font-size="13" font-weight="bold" fill="#EA580C">${cleanProgramTitle}</text>

  <!-- 4. Date of Completion -->
  <text x="286" y="556" text-anchor="middle" font-family="CertInterBold, sans-serif" font-size="11.5" font-weight="bold" fill="#262626">${date}</text>

  <!-- 5. Verification Code (Perfectly centered horizontally & vertically inside footer box) -->
  <text x="477" y="632.5" text-anchor="middle" dominant-baseline="central" font-family="CertInterBold, monospace" font-size="12" font-weight="bold" fill="#C2410C" letter-spacing="0.5">${certId}</text>
</svg>`;
}

export async function renderCertificatePng(input: CertificateRenderInput): Promise<Buffer> {
  const overlaySvg = buildMasterCertificateOverlaySvg(input);

  return sharp(MASTER_TEMPLATE_PATH)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png({ quality: 100, compressionLevel: 6 })
    .toBuffer();
}
