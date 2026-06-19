import {
  OFFICIAL_WHATSAPP_NUMBER,
  OFFICIAL_HELP_MESSAGE,
  getOfficialWhatsAppUrl,
} from "@/lib/constants/contact";

export const HELP_CONFIG = {
  whatsappNumber: OFFICIAL_WHATSAPP_NUMBER,
  whatsappDisplay: "0337-4005515",
  whatsappMessage: OFFICIAL_HELP_MESSAGE,
  get whatsappUrl() {
    return getOfficialWhatsAppUrl(this.whatsappMessage);
  },
} as const;

export const SIMPLE_STEPS = [
  {
    step: "1",
    title: "Fill the form",
    desc: "Write your name, WhatsApp number, and choose your course.",
  },
  {
    step: "2",
    title: "Pay Rs 1,000",
    desc: "Send money on Easypaisa and upload the payment screenshot.",
  },
  {
    step: "3",
    title: "Join on WhatsApp",
    desc: "After verification, you get class link, videos, and assignments.",
  },
] as const;
