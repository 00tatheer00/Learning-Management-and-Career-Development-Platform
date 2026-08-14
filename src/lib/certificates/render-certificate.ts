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

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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

// Render glyph-by-glyph with fill-rule="evenodd" for crisp, beautiful vector curves
function renderTextByGlyphs(
  font: opentype.Font | null,
  text: string,
  targetX: number,
  targetY: number,
  size: number,
  fill: string,
  anchor: "start" | "middle" = "start",
  letterSpacing = 0
): string {
  if (!font) {
    return `<text x="${targetX}" y="${targetY}" text-anchor="${anchor}" font-size="${size}" fill="${fill}">${escapeXml(text)}</text>`;
  }

  try {
    let svgPaths = "";
    let cursorX = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const glyph = font.charToGlyph(ch);
      if (ch !== " ") {
        const charPath = glyph.getPath(cursorX, 0, size);
        svgPaths += charPath.toSVG(4);
      }
      const adv = glyph.advanceWidth || 0;
      cursorX += (adv / font.unitsPerEm) * size + letterSpacing;
    }

    const totalWidth = cursorX - letterSpacing;
    const offsetX = anchor === "middle" ? targetX - totalWidth / 2 : targetX;
    return `<g fill="${fill}" fill-rule="evenodd" transform="translate(${offsetX},${targetY})">${svgPaths}</g>`;
  } catch {
    return `<text x="${targetX}" y="${targetY}" text-anchor="${anchor}" font-size="${size}" fill="${fill}">${escapeXml(text)}</text>`;
  }
}

export function buildMasterCertificateOverlaySvg(input: CertificateRenderInput): string {
  const width = 1024;
  const height = 682;

  // Clean brackets and format name into Title Case for gorgeous calligraphy aesthetics
  const cleanModule = input.moduleName.replace(/^\[\s*/, "").replace(/\s*\]$/, "");
  const cleanProgram = input.programTitle.replace(/^\[\s*/, "").replace(/\s*\]$/, "");
  const date = input.completionDate;
  const certId = input.certificateId;

  const formattedName = toTitleCase(input.studentName);
  const nameLen = formattedName.length;
  // Scaled for elegance & balance
  const nameFontSize = nameLen > 30 ? 32 : nameLen > 22 ? 38 : 44;

  // 1. Student Name (PERFECTLY CENTERED above the gold line diamond at x=530, y=350)
  const nameSvg = renderTextByGlyphs(scriptFont, formattedName, 530, 350, nameFontSize, "#0D1117", "middle");

  // 2. Module Name (Orange Bold — pixel-perfect baseline aligned with "has successfully completed the ")
  const moduleSvg = renderTextByGlyphs(boldFont, cleanModule, 586, 397, 12.5, "#EA580C", "start");

  // 3. Course Name (Orange Bold — pixel-perfect baseline aligned with "as part of the ")
  const courseSvg = renderTextByGlyphs(boldFont, cleanProgram, 526, 421, 12.5, "#EA580C", "start");

  // 4. Date of Completion (Centered under DATE heading)
  const dateSvg = renderTextByGlyphs(boldFont, date, 286, 556, 11.5, "#262626", "middle");

  // 5. Verification Code (Centered in footer pill box)
  const codeSvg = renderTextByGlyphs(boldFont, certId, 477, 633, 12, "#C2410C", "middle", 0.5);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 1024 682" xmlns="http://www.w3.org/2000/svg">
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
