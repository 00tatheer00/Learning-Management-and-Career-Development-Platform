import { ensureScheduledLiveSessions } from "../src/lib/sessions/ensure-scheduled-sessions";

async function main() {
  const result = await ensureScheduledLiveSessions();
  console.log("Scheduled sessions:", result);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
