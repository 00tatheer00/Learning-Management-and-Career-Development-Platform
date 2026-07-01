import { sendWhatsAppMessage } from "../src/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "../src/lib/site-url";

const KOMAL_PHONE = "03115969527";
const KOMAL_EMAIL = "komal@eest.com";
const KOMAL_PASSWORD = "komal@003";

function buildKomalStudentExportMessage() {
  const loginUrl = getPortalLoginUrl();

  return `Assalam o Alaikum Komal! 👋

*Tatheer* ne aap ke liye *student lists (CSV download)* enable kar di hain — WhatsApp groups banane ke liye.

📋 *Kya karna hai*
1️⃣ Admin portal login karein
2️⃣ Sidebar → *Students*
3️⃣ Upar *Web group* aur *App group* — dono alag CSV download karein
4️⃣ Excel / Google Sheets mein open karein — *WhatsApp* column se numbers lein
5️⃣ Web students ka alag WhatsApp group, App students ka alag group banayein

⚠️ WhatsApp mein members ek ek kar ke add karne padte hain — ya group *invite link* bhej dein taake students khud join karein (zyada easy).

🔐 *Login*
Username: ${KOMAL_EMAIL}
Password: ${KOMAL_PASSWORD}
Link: ${loginUrl}
(*Admin* tab select karein)

✅ Aap *view + download* kar sakti hain
❌ Approve / edit / delete nahi — sirf Tatheer

Koi masla ho to Tatheer se rabta karein.

— Emerging Edge School of Technology
Learn. Build. Lead.`;
}

async function main() {
  const result = await sendWhatsAppMessage(KOMAL_PHONE, buildKomalStudentExportMessage());

  if (result.sent) {
    console.log(`WhatsApp sent to ${KOMAL_PHONE}`);
  } else {
    console.error("WhatsApp failed:", result.error ?? "Unknown error");
    process.exit(1);
  }
}

void main();
