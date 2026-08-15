import * as opentype from "opentype.js";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import {
  CINZEL_TTF_B64,
  GREAT_VIBES_TTF_B64,
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
  if (!str) return "";
  return str
    .trim()
    .split(/\s+/)
    .map((word) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ");
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

const nameFont = loadEmbeddedFont(CINZEL_TTF_B64) ?? loadEmbeddedFont(GREAT_VIBES_TTF_B64);
const boldFont = loadEmbeddedFont(INTER_BOLD_TTF_B64);

// Render glyph-by-glyph with fill-rule="nonzero" for solid, unbroken vector curves
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
    return `<g fill="${fill}" fill-rule="nonzero" transform="translate(${offsetX},${targetY})">${svgPaths}</g>`;
  } catch {
    return `<text x="${targetX}" y="${targetY}" text-anchor="${anchor}" font-size="${size}" fill="${fill}">${escapeXml(text)}</text>`;
  }
}

export function buildMasterCertificateOverlaySvg(
  input: CertificateRenderInput,
  renderWidth = 2048,
  renderHeight = 1364
): string {
  // Clean brackets and format name
  const cleanModule = input.moduleName.replace(/^\[\s*/, "").replace(/\s*\]$/, "");
  const cleanProgram = input.programTitle.replace(/^\[\s*/, "").replace(/\s*\]$/, "");
  const date = input.completionDate;
  const certId = input.certificateId;

  const formattedName = toTitleCase(input.studentName);
  const nameLen = formattedName.length;
  // Scaled for elegance & balance
  const nameFontSize = nameLen > 28 ? 26 : nameLen > 20 ? 30 : 34;

  // 1. Student Name (PERFECTLY CENTERED above the gold line diamond at x=530, y=345)
  const nameSvg = renderTextByGlyphs(nameFont, formattedName.toUpperCase(), 530, 345, nameFontSize, "#0D1117", "middle", 0.5);

  // 2. Module Name (Orange Bold — perfectly spaced after "has successfully completed the ")
  const moduleSvg = renderTextByGlyphs(boldFont, cleanModule, 600, 397, 12.5, "#EA580C", "start");

  // 3. Course Name (Orange Bold — perfectly spaced after "as part of the ")
  const courseSvg = renderTextByGlyphs(boldFont, cleanProgram, 540, 421, 12.5, "#EA580C", "start");

  // 4. Date of Completion (Centered under DATE heading)
  const dateSvg = renderTextByGlyphs(boldFont, date, 286, 556, 11.5, "#262626", "middle");

  // 5. Verification Code (PERFECTLY CENTERED in footer box at x=488, y=635)
  const codeSvg = renderTextByGlyphs(boldFont, certId, 488, 635, 11.5, "#C2410C", "middle", 0.5);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${renderWidth}" height="${renderHeight}" viewBox="0 0 1024 682" xmlns="http://www.w3.org/2000/svg">
  ${nameSvg}
  ${moduleSvg}
  ${courseSvg}
  ${dateSvg}
  ${codeSvg}
</svg>`;
}

export async function renderCertificatePng(input: CertificateRenderInput): Promise<Buffer> {
  const overlaySvg = buildMasterCertificateOverlaySvg(input, 2048, 1364);

  return sharp(templateBuffer)
    .resize(2048, 1364, { kernel: sharp.kernel.lanczos3, fit: "fill" })
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png({ quality: 100, compressionLevel: 6 })
    .toBuffer();
}

/**
 * Render an official Ultra High-Quality Print-Ready PDF Certificate (300 DPI density).
 */
export async function renderCertificatePdf(input: CertificateRenderInput): Promise<Buffer> {
  const pngBuffer = await renderCertificatePng(input);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([1024, 682]);
  const pngImage = await pdfDoc.embedPng(pngBuffer);

  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: 1024,
    height: 682,
  });

  pdfDoc.setTitle(`Certificate of Completion - ${input.studentName}`);
  pdfDoc.setAuthor("Emerging Edge School of Technology");
  pdfDoc.setSubject(`Certificate of Completion for ${input.moduleName}`);
  pdfDoc.setCreator("Emerging Edge School Portal");
  pdfDoc.setProducer("Emerging Edge School Portal");

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
