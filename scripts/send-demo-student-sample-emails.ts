import { sendDemoStudentSampleEmails } from "../src/lib/notifications/send-student-email-samples";

async function main() {
  const result = await sendDemoStudentSampleEmails();

  console.log("Demo inbox:", result.demoEmail);
  console.log("Class reminder:", result.classReminder);
  console.log("New assignment:", result.newAssignment);

  if (!result.classReminder.sent || !result.newAssignment.sent) {
    process.exit(1);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
