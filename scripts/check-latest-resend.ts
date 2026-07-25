import { Resend } from "resend";

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("No RESEND_API_KEY found in environment.");
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  try {
    console.log("Fetching emails from Resend...");
    const response = await resend.emails.list({ limit: 10 });
    if (response.error) {
      console.error("Resend API error:", response.error);
      process.exit(1);
    }

    const emails = response.data?.data || [];
    console.log(`Retrieved ${emails.length} emails from Resend.`);
    for (const email of emails) {
      console.log(`- ID: ${email.id}, To: ${JSON.stringify(email.to)}, Subject: ${email.subject}, Created: ${email.created_at}`);
    }
  } catch (error) {
    console.error("Failed to fetch emails from Resend:", error);
  }
}

void main();
