import { PAYMENT_CONFIG } from "@/lib/constants/payment";

export const HELP_CONFIG = {
  whatsappNumber: PAYMENT_CONFIG.easypaisa.number,
  whatsappDisplay: "0327-5792600",
  whatsappMessage:
    "Assalam o Alaikum! I need help with registration at Emerging Edge School.",
  get whatsappUrl() {
    return `https://wa.me/92${this.whatsappNumber.replace(/^0/, "")}?text=${encodeURIComponent(this.whatsappMessage)}`;
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
