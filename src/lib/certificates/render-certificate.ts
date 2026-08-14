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

// ---------------------------------------------------------------------------
// Resolve asset paths — try __dirname-relative first (Vercel serverless),
// then fall back to process.cwd()/public (local dev).
// ---------------------------------------------------------------------------
function resolveAsset(...segments: string[]): string {
  // 1. Try __dirname-relative (bundled alongside this file in Vercel)
  const dirRelative = path.join(__dirname, ...segments);
  if (fs.existsSync(dirRelative)) return dirRelative;

  // 2. Fallback to process.cwd()/public (local dev)
  const cwdRelative = path.join(process.cwd(), "public", ...segments);
  if (fs.existsSync(cwdRelative)) return cwdRelative;

  // 3. Try process.cwd() directly
  const cwdDirect = path.join(process.cwd(), ...segments);
  if (fs.existsSync(cwdDirect)) return cwdDirect;

  throw new Error(`Asset not found: ${segments.join("/")}`);
}

// Master certificate artwork template
const MASTER_TEMPLATE_PATH = (() => {
  try {
    return resolveAsset("assets", "certificate-master-template.png");
  } catch {
    return path.join(process.cwd(), "public/certificates/certificate-master-template.png");
  }
})();

// ---------------------------------------------------------------------------
// Load TTF fonts via opentype.js — converts ALL text to vector <path> data.
// Guaranteed identical rendering on Windows, Linux, Vercel, Docker.
// ---------------------------------------------------------------------------
function loadFont(dirRelPath: string, publicRelPath: string): opentype.Font | null {
  try {
    let fontPath: string;
    try {
      fontPath = resolveAsset(...dirRelPath.split("/"));
    } catch {
      fontPath = path.join(process.cwd(), publicRelPath);
    }
    const buf = fs.readFileSync(fontPath);
    return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  } catch (err) {
    console.error(`Warning: could not load font:`, err);
    return null;
  }
}

const scriptFont = loadFont("fonts/AlexBrush-Regular.ttf", "public/fonts/AlexBrush-Regular.ttf");
const boldFont = loadFont("fonts/Inter-Bold.ttf", "public/fonts/Inter-Bold.ttf");

// Helper: render text string to SVG <path> using opentype vector outlines
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
    // Render each character individually to avoid librsvg single-path-d truncation
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
  <!-- All text rendered as vector <path> outlines — zero font dependencies -->
  ${nameSvg}
  ${moduleSvg}
  ${courseSvg}
  ${dateSvg}
  ${codeSvg}
</svg>`;
}

export async function renderCertificatePng(input: CertificateRenderInput): Promise<Buffer> {
  const overlaySvg = buildMasterCertificateOverlaySvg(input);

  return sharp(MASTER_TEMPLATE_PATH)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png({ quality: 100, compressionLevel: 6 })
    .toBuffer();
}
