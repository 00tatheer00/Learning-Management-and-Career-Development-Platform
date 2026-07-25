const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const width = 1600;
const height = 1131; // Standard A4 Landscape ratio (1.414)

const studentName = "Muhammad Ali";
const programTitle = "Web Development";
const moduleName = "HTML &amp; CSS Fundamentals";
const issueDate = "July 11, 2026";
const certId = "EEST-CERT-2026-9841";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D97706" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F8FAFC" />
    </linearGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Outer Navy Border Frame -->
  <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="url(#navyGrad)" stroke-width="12" rx="4" />
  
  <!-- Inner Gold Border Frame -->
  <rect x="60" y="60" width="${width - 120}" height="${height - 120}" fill="none" stroke="url(#goldGrad)" stroke-width="3" rx="2" />
  <rect x="68" y="68" width="${width - 136}" height="${height - 136}" fill="none" stroke="url(#goldGrad)" stroke-width="1" opacity="0.6" rx="2" />

  <!-- Corner Ornamental Accents -->
  <path d="M 40,90 L 90,40 M 40,110 L 110,40 M 60,130 L 130,60" stroke="url(#goldGrad)" stroke-width="2" opacity="0.4" />
  <path d="M ${width - 40},90 L ${width - 90},40 M ${width - 40},110 L ${width - 110},40 M ${width - 60},130 L ${width - 130},60" stroke="url(#goldGrad)" stroke-width="2" opacity="0.4" />
  <path d="M 40,${height - 90} L 90,${height - 40} M 40,${height - 110} L 110,${height - 40} M 60,${height - 130} L 130,${height - 60}" stroke="url(#goldGrad)" stroke-width="2" opacity="0.4" />
  <path d="M ${width - 40},${height - 90} L ${width - 90},${height - 40} M ${width - 40},${height - 110} L ${width - 110},${height - 40} M ${width - 60},${height - 130} L ${width - 130},${height - 60}" stroke="url(#goldGrad)" stroke-width="2" opacity="0.4" />

  <!-- Header Section -->
  <text x="${width / 2}" y="170" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="22" font-weight="700" letter-spacing="4" fill="#0F172A">EMERGING EDGE SCHOOL OF TECHNOLOGY</text>
  
  <text x="${width / 2}" y="245" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="44" font-weight="700" letter-spacing="3" fill="url(#goldGrad)">CERTIFICATE OF COMPLETION</text>
  
  <line x1="${width / 2 - 180}" y1="275" x2="${width / 2 + 180}" y2="275" stroke="url(#goldGrad)" stroke-width="2" />
  <circle cx="${width / 2}" cy="275" r="5" fill="#D97706" />

  <!-- Presentation Text -->
  <text x="${width / 2}" y="350" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-style="italic" fill="#64748B">This is to certify that</text>

  <!-- Student Name -->
  <text x="${width / 2}" y="450" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="60" font-weight="700" fill="#0F172A">${studentName}</text>
  <line x1="${width / 2 - 320}" y1="480" x2="${width / 2 + 320}" y2="480" stroke="#CBD5E1" stroke-width="1.5" />

  <!-- Course & Module Details -->
  <text x="${width / 2}" y="550" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" fill="#475569">has successfully completed all requirements and coursework for the module</text>
  
  <text x="${width / 2}" y="620" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="34" font-weight="700" fill="#1E293B">${moduleName}</text>
  
  <text x="${width / 2}" y="665" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="500" fill="#0F172A">Program: ${programTitle}</text>

  <!-- Footer Section Grid -->
  <text x="240" y="850" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="22" font-weight="700" fill="#0F172A">${issueDate}</text>
  <line x1="140" y1="870" x2="340" y2="870" stroke="#94A3B8" stroke-width="1.5" />
  <text x="240" y="895" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="1" fill="#64748B">DATE OF ISSUANCE</text>

  <!-- Center Badge / Seal -->
  <g transform="translate(${width / 2}, 850)">
    <path d="M -30,25 L -55,85 L -25,75 L 0,85 L -10,35 Z" fill="#B45309" />
    <path d="M 30,25 L 55,85 L 25,75 L 0,85 L 10,35 Z" fill="#D97706" />
    <circle cx="0" cy="0" r="54" fill="url(#goldGrad)" />
    <circle cx="0" cy="0" r="46" fill="#0F172A" />
    <circle cx="0" cy="0" r="42" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-dasharray="4 2" />
    <text x="0" y="-8" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="12" font-weight="700" letter-spacing="1" fill="#F59E0B">OFFICIAL</text>
    <text x="0" y="8" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="14" font-weight="700" letter-spacing="1" fill="#FFFFFF">SEAL</text>
    <text x="0" y="22" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="600" fill="#F59E0B">EEST ACADEMY</text>
  </g>

  <!-- Right Side: Signature -->
  <path d="M ${width - 320},835 C ${width - 280},800 ${width - 240},860 ${width - 200},820 C ${width - 180},800 ${width - 160},840 ${width - 140},830" fill="none" stroke="#1E293B" stroke-width="2.5" />
  <line x1="${width - 340}" y1="870" x2="${width - 140}" y2="870" stroke="#94A3B8" stroke-width="1.5" />
  <text x="${width - 240}" y="895" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="1" fill="#64748B">AUTHORIZED SIGNATURE</text>

  <!-- Bottom Verification Bar -->
  <rect x="60" y="${height - 110}" width="${width - 120}" height="40" fill="#F1F5F9" rx="4" />
  <text x="100" y="${height - 85}" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#334155">VERIFICATION ID: ${certId}</text>
  <text x="${width - 100}" y="${height - 85}" text-anchor="end" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="500" fill="#64748B">Emerging Edge School of Technology · Verified Credential</text>
</svg>`;

const outputPath = "C:/Users/hp/.gemini/antigravity-ide/brain/8e340659-b153-4561-b4a0-cbb606bd004b/vector_certificate_preview.png";

sharp(Buffer.from(svg))
  .png({ quality: 100 })
  .toFile(outputPath)
  .then(() => console.log("Saved vector certificate to:", outputPath))
  .catch((err) => console.error(err));
