/**
 * Formats a Pakistani phone number (e.g. 03115969527, 923115969527, or +923115969527)
 * into a standard international format without leading + for wa.me links: 923115969527
 */
export function formatWhatsAppWaId(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92")) {
    return digits;
  }
  if (digits.startsWith("0")) {
    return `92${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Builds a direct wa.me link with pre-filled encoded text message for WhatsApp Web / WhatsApp Desktop / Mobile WhatsApp app.
 */
export function getWhatsAppDirectLink(phone: string, textMessage: string): string {
  const waId = formatWhatsAppWaId(phone);
  const encodedText = encodeURIComponent(textMessage);
  return `https://wa.me/${waId}?text=${encodedText}`;
}

/**
 * Pre-filled template for Enrollment Approval WhatsApp Direct Message
 */
export function buildApprovalWhatsAppMessage(data: {
  studentName: string;
  programTitle: string;
  email?: string;
  portalLoginUrl?: string;
}): string {
  const name = data.studentName.trim();
  const program = data.programTitle.trim();
  const email = data.email?.trim();
  const loginUrl = data.portalLoginUrl || "https://emergingedgeschool.com/login";

  return `*Assalam-o-Alaikum ${name}!* 🎉

Congratulations! Your registration for *${program}* at Emerging Edge School of Technology has been *APPROVED* ✅

${email ? `📧 Your portal login details have been sent to your email: *${email}*\n` : ""}
🔗 *Student Portal Login:*
${loginUrl}

If you have any questions, feel free to reply to this message. Welcome aboard! 🚀`;
}

/**
 * Pre-filled template for Enrollment Rejection WhatsApp Direct Message
 */
export function buildRejectionWhatsAppMessage(data: {
  studentName: string;
  programTitle: string;
  reason?: string;
}): string {
  const name = data.studentName.trim();
  const program = data.programTitle.trim();
  const reason = data.reason?.trim();

  return `*Assalam-o-Alaikum ${name},*

This is regarding your application for *${program}* at Emerging Edge School of Technology.

Unfortunately, your application could not be approved at this time.${reason ? `\n\n*Reason:* ${reason}` : ""}

If you believe there was an error with your payment receipt, please reply here with a clear screenshot of your payment receipt so our team can assist you. Thank you!`;
}
