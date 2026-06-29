import { PrismaClient } from "@prisma/client";
import { sendWhatsAppMessage } from "../src/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "../src/lib/site-url";
import { getDatabaseUrl } from "../src/lib/database-url";

const KOMAL_PHONE = "03115969527";
const KOMAL_EMAIL = "komal@eest.com";
const KOMAL_PASSWORD = "komal@003";

function buildViewerAdminWhatsAppMessage() {
  const loginUrl = getPortalLoginUrl();

  return `Assalam o Alaikum Komal! 👋

*Tatheer* ne aap ko *Emerging Edge School of Technology* ke Admin Portal par *Viewer Admin* access diya hai.

Aap poora admin portal *dekh* sakti hain — registrations, students, revenue, sab.
⚠️ *View only:* approve, edit ya delete nahi kar sakti. Changes ke liye Tatheer se rabta karein.

🔐 *Portal Login*
Username: ${KOMAL_EMAIL}
Password: ${KOMAL_PASSWORD}
Login: ${loginUrl}

*Login steps:*
1️⃣ Link open karein
2️⃣ *Admin* tab select karein
3️⃣ Username & password enter karein

Login details private rakhein. Koi masla ho to Tatheer se contact karein.

— Emerging Edge School of Technology
Learn. Build. Lead.`;
}

async function main() {
  const prisma = new PrismaClient({
    datasources: { db: { url: getDatabaseUrl() } },
  });

  try {
    await prisma.user.updateMany({
      where: { email: KOMAL_EMAIL },
      data: { phone: KOMAL_PHONE },
    });

    const result = await sendWhatsAppMessage(KOMAL_PHONE, buildViewerAdminWhatsAppMessage());

    if (result.sent) {
      console.log(`WhatsApp sent to ${KOMAL_PHONE} for ${KOMAL_EMAIL}`);
    } else {
      console.error("WhatsApp failed:", result.error ?? "Unknown error");
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
