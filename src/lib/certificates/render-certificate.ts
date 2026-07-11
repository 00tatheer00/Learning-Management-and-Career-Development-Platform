import "server-only";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export interface CertificateRenderInput {
  studentName: string;
  moduleName: string;
  programTitle: string;
  completionDate: string;
  certificateId: string;
}

const TEMPLATE_PATH = path.join(process.cwd(), "public/certificates/certificate-template.png");

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildOverlaySvg(width: number, input: CertificateRenderInput): Buffer {
  const name = escapeXml(input.studentName);
  const moduleLine = escapeXml(`${input.moduleName.toUpperCase()} — ${input.programTitle.toUpperCase()}`);
  const date = escapeXml(input.completionDate);
  const certId = escapeXml(input.certificateId);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="724" xmlns="http://www.w3.org/2000/svg">
  <rect x="32" y="248" width="${width - 64}" height="64" fill="#ffffff"/>
  <rect x="32" y="332" width="${width - 64}" height="30" fill="#ffffff"/>
  <rect x="388" y="502" width="248" height="26" fill="#ffffff"/>
  <rect x="72" y="636" width="220" height="26" fill="#ffffff"/>
  <rect x="372" y="636" width="268" height="26" fill="#ffffff"/>

  <text x="${width / 2}" y="292" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="42" font-weight="700" fill="#141414">${name}</text>
  <text x="${width / 2}" y="356" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#141414">${moduleLine}</text>
  <text x="${width / 2}" y="522" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#141414">${date}</text>
  <text x="118" y="656" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#141414">${date}</text>
  <text x="418" y="656" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#141414">${certId}</text>
</svg>`;

  return Buffer.from(svg);
}

export async function renderCertificatePng(input: CertificateRenderInput): Promise<Buffer> {
  await fs.access(TEMPLATE_PATH);
  const meta = await sharp(TEMPLATE_PATH).metadata();
  const width = meta.width ?? 1024;
  const overlay = buildOverlaySvg(width, input);

  return sharp(TEMPLATE_PATH)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png({ quality: 96 })
    .toBuffer();
}
