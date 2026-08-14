import * as opentype from "opentype.js";
import sharp from "sharp";
import {
  ALEX_BRUSH_TTF_B64,
  INTER_BOLD_TTF_B64,
  CERTIFICATE_TEMPLATE_B64,
} from "./embedded-fonts";

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

// ---------------------------------------------------------------------------
// Fonts & template are embedded as base64 constants — NO filesystem access.
// Works identically on Windows, Linux, Vercel serverless, Docker, everywhere.
// ---------------------------------------------------------------------------
const templateBuffer = Buffer.from(CERTIFICATE_TEMPLATE_B64, "base64");

function loadEmbeddedFont(b64: string): opentype.Font | null {
  try {
    const buf = Buffer.from(b64, "base64");
    return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  } catch (err) {
    console.error("Warning: could not parse embedded font:", err);
    return null;
  }
}

const scriptFont = loadEmbeddedFont(ALEX_BRUSH_TTF_B64);
const boldFont = loadEmbeddedFont(INTER_BOLD_TTF_B64);

// Render text string to SVG <path> elements using opentype vector outlines.
// Each character is rendered as a separate <path> to avoid librsvg d-attr truncation.
function textToVectorSvg(
  font: opentype.Font | null,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fill: string,
  anchor: "start" | "middle" = "start",
  letterSpacing = 0
): string {
  if (!font) {
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${fontSize}" fill="${fill}">${escapeXml(text)}</text>`;
  }

  try {
    let svgPaths = "";
    let cursorX = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch !== " ") {
        const charPath = font.getPath(ch, cursorX, 0, fontSize);
        svgPaths += charPath.toSVG(4);
      }
      const adv = font.charToGlyph(ch).advanceWidth || 0;
      cursorX += (adv / font.unitsPerEm) * fontSize + letterSpacing;
    }
    const totalWidth = cursorX - letterSpacing;
    const offsetX = anchor === "middle" ? x - totalWidth / 2 : x;
    return `<g fill="${fill}" transform="translate(${offsetX},${y})">${svgPaths}</g>`;
  } catch {
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${fontSize}" fill="${fill}">${escapeXml(text)}</text>`;
  }
}

export function buildMasterCertificateOverlaySvg(input: CertificateRenderInput): string {
  const width = 1024;
  const height = 682;

  // Clean brackets from raw input if present
  const cleanModule = input.moduleName.replace(/^\[\s*/, "").replace(/\s*\]$/, "");
  const cleanProgram = input.programTitle.replace(/^\[\s*/, "").replace(/\s*\]$/, "");
  const date = input.completionDate;
  const certId = input.certificateId;

  // Student Name — auto-scale for long names
  const rawName = input.studentName.trim();
  const nameLen = rawName.length;
  const nameFontSize = nameLen > 32 ? 38 : nameLen > 24 ? 46 : nameLen > 18 ? 54 : 64;

  // 1. Student Name (Centered Calligraphy Vector Paths)
  const nameSvg = textToVectorSvg(scriptFont, rawName, 585, 338, nameFontSize, "#0D1117", "middle");

  // 2. Module Name (Orange Bold — right after "has successfully completed the")
  const moduleSvg = textToVectorSvg(boldFont, cleanModule, 574, 394, 13, "#EA580C", "start");

  // 3. Course Name (Orange Bold — right after "as part of the")
  const courseSvg = textToVectorSvg(boldFont, cleanProgram, 520, 418, 13, "#EA580C", "start");

  // 4. Date of Completion (Centered under DATE heading)
  const dateSvg = textToVectorSvg(boldFont, date, 286, 556, 11.5, "#262626", "middle");

  // 5. Verification Code (Centered in footer pill box)
  const codeSvg = textToVectorSvg(boldFont, certId, 477, 632.5, 12, "#C2410C", "middle", 0.5);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${nameSvg}
  ${moduleSvg}
  ${courseSvg}
  ${dateSvg}
  ${codeSvg}
</svg>`;
}

export async function renderCertificatePng(input: CertificateRenderInput): Promise<Buffer> {
  const overlaySvg = buildMasterCertificateOverlaySvg(input);

  return sharp(templateBuffer)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png({ quality: 100, compressionLevel: 6 })
    .toBuffer();
}
