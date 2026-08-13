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

export function buildMasterCertificateSvg(input: CertificateRenderInput): string {
  const width = 1200;
  const height = 800;

  const name = escapeXml(input.studentName);
  const moduleName = escapeXml(input.moduleName);
  const programTitle = escapeXml(input.programTitle);
  const date = escapeXml(input.completionDate);
  const certId = escapeXml(input.certificateId);

  const nameLen = input.studentName.length;
  const nameFontSize = nameLen > 32 ? 34 : nameLen > 24 ? 42 : nameLen > 18 ? 50 : 58;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCFCFA"/>
      <stop offset="50%" stop-color="#FAF8F5"/>
      <stop offset="100%" stop-color="#F4F0EA"/>
    </linearGradient>

    <!-- Gold Foil Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BF953F"/>
      <stop offset="25%" stop-color="#FCF6BA"/>
      <stop offset="50%" stop-color="#B38728"/>
      <stop offset="75%" stop-color="#FBF5B7"/>
      <stop offset="100%" stop-color="#AA771C"/>
    </linearGradient>

    <!-- Orange Gradient -->
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B00"/>
      <stop offset="100%" stop-color="#D94E00"/>
    </linearGradient>

    <!-- Navy Dark Gradient -->
    <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B132B"/>
      <stop offset="100%" stop-color="#1C2541"/>
    </linearGradient>

    <!-- Ribbon Gradient -->
    <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0D1117"/>
      <stop offset="100%" stop-color="#161B22"/>
    </linearGradient>
  </defs>

  <!-- Base Canvas Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>

  <!-- Subtle Inner Watermark Wavy Lines Pattern -->
  <path d="M 0 100 Q 300 150 600 100 T 1200 100 M 0 300 Q 300 350 600 300 T 1200 300 M 0 500 Q 300 550 600 500 T 1200 500 M 0 700 Q 300 750 600 700 T 1200 700" 
        fill="none" stroke="#E2D8CE" stroke-width="0.8" opacity="0.4"/>

  <!-- Main Outer Gold Border -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="url(#goldGrad)" stroke-width="4"/>
  <rect x="28" y="28" width="${width - 56}" height="${height - 56}" fill="none" stroke="#0B132B" stroke-width="1.5" opacity="0.8"/>

  <!-- Top-Right Geometric Dark & Orange Accents -->
  <path d="M 980 20 L 1180 20 L 1180 220 Z" fill="url(#navyGrad)"/>
  <path d="M 1040 20 L 1180 20 L 1180 160 Z" fill="url(#orangeGrad)"/>
  <path d="M 1100 20 L 1180 20 L 1180 100 Z" fill="#0B132B"/>

  <!-- Bottom-Left Geometric Dark & Orange Accents -->
  <path d="M 20 580 L 220 780 L 20 780 Z" fill="url(#navyGrad)"/>
  <path d="M 20 640 L 160 780 L 20 780 Z" fill="url(#orangeGrad)"/>
  <path d="M 20 700 L 100 780 L 20 780 Z" fill="#0B132B"/>

  <!-- Left Ribbon Base (Black/Gold) -->
  <g transform="translate(65, 20)">
    <!-- Ribbon Tail Body -->
    <path d="M 0 0 L 76 0 L 76 280 L 38 250 L 0 280 Z" fill="url(#ribbonGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M 6 0 L 70 0 L 70 268 L 38 242 L 6 268 Z" fill="#090C10"/>

    <!-- Gold Shield Badge "ACHIEVEMENT UNLOCKED" -->
    <circle cx="38" cy="140" r="42" fill="url(#goldGrad)"/>
    <circle cx="38" cy="140" r="38" fill="#090C10"/>
    <circle cx="38" cy="140" r="35" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="3,2"/>
    
    <!-- Gold Star & Text -->
    <path d="M 38 116 L 41 123 L 48 124 L 43 129 L 44 136 L 38 132 L 32 136 L 33 129 L 28 124 L 35 123 Z" fill="url(#goldGrad)"/>
    <text x="38" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="900" fill="#FCF6BA" letter-spacing="0.5">ACHIEVEMENT</text>
    <text x="38" y="157" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="900" fill="#FCF6BA" letter-spacing="0.5">UNLOCKED</text>
    <text x="38" y="167" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="url(#goldGrad)">★ ★ ★</text>
  </g>

  <!-- Header Logo & Branding -->
  <g transform="translate(430, 50)">
    <!-- Shield Logo Box -->
    <rect x="0" y="0" width="56" height="56" rx="8" fill="#0B132B"/>
    <path d="M 28 8 L 46 16 V 32 C 46 42 28 50 28 50 C 28 50 10 42 10 32 V 16 Z" fill="url(#orangeGrad)"/>
    <path d="M 28 14 L 38 20 L 28 26 L 18 20 Z" fill="#FFFFFF"/>
    <path d="M 24 24 H 32 V 36 H 24 Z" fill="#FFFFFF"/>
    
    <!-- Organization Titles -->
    <text x="72" y="24" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900" fill="#0B132B" letter-spacing="1">EMERGING EDGE</text>
    <text x="72" y="40" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="700" fill="#475569" letter-spacing="3">SCHOOL OF TECHNOLOGY</text>
    <line x1="72" y1="46" x2="330" y2="46" stroke="#CBD5E1" stroke-width="1"/>
    <text x="72" y="58" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="800" fill="#EA580C" letter-spacing="1.5">POWERED BY TECH4EDGES*</text>
  </g>

  <!-- Title Section -->
  <g transform="translate(600, 175)">
    <text x="0" y="0" text-anchor="middle" font-family="'Georgia', 'Times New Roman', serif" font-size="46" font-weight="900" fill="#0B132B" letter-spacing="8">CERTIFICATE</text>
    
    <!-- Divider Ribbon Line -->
    <line x1="-220" y1="20" x2="-30" y2="20" stroke="url(#orangeGrad)" stroke-width="2"/>
    <polygon points="-25,20 -20,15 -15,20 -20,25" fill="#EA580C"/>
    <text x="0" y="25" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" font-weight="900" fill="#EA580C" letter-spacing="4">OF COMPLETION</text>
    <polygon points="15,20 20,15 25,20 20,25" fill="#EA580C"/>
    <line x1="30" y1="20" x2="220" y2="20" stroke="url(#orangeGrad)" stroke-width="2"/>

    <!-- Certify Line -->
    <text x="0" y="56" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="800" fill="#64748B" letter-spacing="3">THIS IS TO CERTIFY THAT</text>
  </g>

  <!-- Dynamic Student Name -->
  <g transform="translate(600, 290)">
    <text x="0" y="0" text-anchor="middle" font-family="'Georgia', 'Times New Roman', serif" font-style="italic" font-size="${nameFontSize}" font-weight="700" fill="#0F172A">${name}</text>
    <line x1="-320" y1="20" x2="320" y2="20" stroke="#CBD5E1" stroke-width="1.5"/>
    <polygon points="0,20 -5,15 0,10 5,15" fill="#EA580C"/>
  </g>

  <!-- Body Achievement Description -->
  <g transform="translate(600, 355)">
    <text x="0" y="0" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="15" font-weight="500" fill="#334155">
      has successfully completed the <tspan font-weight="800" fill="#EA580C">[ ${moduleName} ]</tspan>
    </text>
    <text x="0" y="26" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="15" font-weight="500" fill="#334155">
      as part of the <tspan font-weight="800" fill="#EA580C">[ ${programTitle} ]</tspan>
    </text>
    <text x="0" y="52" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="400" fill="#64748B">
      We appreciate your dedication, hard work and commitment to learning.
    </text>
  </g>

  <!-- Bottom Section (Date, Gold Emblem, Director Signature) -->
  <g transform="translate(0, 480)">
    <!-- Date Block (Left) -->
    <g transform="translate(240, 20)">
      <!-- Calendar Icon -->
      <rect x="0" y="0" width="32" height="32" rx="6" fill="#FF6B00" opacity="0.15"/>
      <path d="M 8 10 H 24 V 24 H 8 Z M 8 14 H 24" fill="none" stroke="#EA580C" stroke-width="2"/>
      <circle cx="12" cy="18" r="1.5" fill="#EA580C"/>
      <circle cx="16" cy="18" r="1.5" fill="#EA580C"/>
      <circle cx="20" cy="18" r="1.5" fill="#EA580C"/>
      
      <text x="42" y="14" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10" font-weight="800" fill="#64748B" letter-spacing="1">DATE OF COMPLETION</text>
      <text x="42" y="30" font-family="'Georgia', serif" font-size="15" font-weight="700" fill="#0F172A">${date}</text>
    </g>

    <!-- Vertical Divider -->
    <line x1="440" y1="20" x2="440" y2="85" stroke="#CBD5E1" stroke-width="1.5"/>

    <!-- Center Gold Emblem -->
    <g transform="translate(600, 52)">
      <circle cx="0" cy="0" r="46" fill="url(#goldGrad)"/>
      <circle cx="0" cy="0" r="41" fill="#090C10"/>
      <circle cx="0" cy="0" r="37" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="4,2"/>
      <path d="M 0 -22 L 14 -12 V 4 C 14 14 0 22 0 22 C 0 22 -14 14 -14 4 V -12 Z" fill="url(#orangeGrad)"/>
      <text x="0" y="1" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" letter-spacing="1">EEST</text>
      <text x="0" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="url(#goldGrad)">★ ★ ★</text>
    </g>

    <!-- Vertical Divider -->
    <line x1="760" y1="20" x2="760" y2="85" stroke="#CBD5E1" stroke-width="1.5"/>

    <!-- Signature Block (Right) -->
    <g transform="translate(840, 20)">
      <!-- Signature Path -->
      <path d="M 10 30 C 25 10 45 40 65 15 C 85 -10 95 35 115 20 C 130 5 145 25 160 15" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="0" y1="42" x2="170" y2="42" stroke="#0B132B" stroke-width="1.5"/>
      <text x="85" y="58" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="800" fill="#0B132B" letter-spacing="1.5">EEST DIRECTOR</text>
    </g>
  </g>

  <!-- Bottom Verification Footer Container -->
  <g transform="translate(180, 680)">
    <!-- Container Pill -->
    <rect x="0" y="0" width="840" height="54" rx="14" fill="#FFFFFF" stroke="#EA580C" stroke-width="1.5"/>

    <!-- Left: Verification Label -->
    <g transform="translate(24, 16)">
      <path d="M 10 2 L 20 6 V 13 C 20 19 10 24 10 24 C 10 24 0 19 0 13 V 6 Z" fill="none" stroke="#EA580C" stroke-width="2"/>
      <path d="M 6 12 L 9 15 L 14 9" fill="none" stroke="#EA580C" stroke-width="2" stroke-linecap="round"/>
      <text x="32" y="16" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="800" fill="#0F172A" letter-spacing="1">VERIFICATION CODE</text>
    </g>

    <!-- Divider -->
    <line x1="230" y1="12" x2="230" y2="42" stroke="#E2E8F0" stroke-width="1.5"/>

    <!-- Center: Code Pill Box -->
    <g transform="translate(250, 10)">
      <rect x="0" y="0" width="200" height="34" rx="8" fill="#FFF7ED" stroke="#FDBA74" stroke-width="1.2"/>
      <text x="100" y="22" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="15" font-weight="800" fill="#C2410C" letter-spacing="1.5">${certId}</text>
    </g>

    <!-- Divider -->
    <line x1="470" y1="12" x2="470" y2="42" stroke="#E2E8F0" stroke-width="1.5"/>

    <!-- Right: Verification URL -->
    <g transform="translate(490, 16)">
      <text x="0" y="12" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10" font-weight="600" fill="#64748B">Verify this certificate on our website</text>
      <text x="0" y="26" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="800" fill="#EA580C">schoolemergingedge.tech/verify</text>
      
      <!-- Globe Icon -->
      <circle cx="310" cy="11" r="10" fill="none" stroke="#EA580C" stroke-width="1.5"/>
      <line x1="300" y1="11" x2="320" y2="11" stroke="#EA580C" stroke-width="1"/>
      <ellipse cx="310" cy="11" rx="5" ry="10" fill="none" stroke="#EA580C" stroke-width="1"/>
    </g>
  </g>
</svg>`;
}

export async function renderCertificatePng(input: CertificateRenderInput): Promise<Buffer> {
  const svg = buildMasterCertificateSvg(input);
  return sharp(Buffer.from(svg))
    .png({ quality: 100, compressionLevel: 6 })
    .toBuffer();
}
