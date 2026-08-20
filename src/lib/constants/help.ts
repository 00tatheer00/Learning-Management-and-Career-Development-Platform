import {
  OFFICIAL_PHONE_NUMBER,
  OFFICIAL_PHONE_DISPLAY,
  OFFICIAL_HELP_MESSAGE,
  getOfficialTelHref,
} from "@/lib/constants/contact";

export const HELP_CONFIG = {
  phoneNumber: OFFICIAL_PHONE_NUMBER,
  phoneDisplay: OFFICIAL_PHONE_DISPLAY,
  helpMessage: OFFICIAL_HELP_MESSAGE,
  get telUrl() {
    return getOfficialTelHref();
  },
} as const;

export const SIMPLE_STEPS = [
  {
    step: "1",
    title: "Fill the form",
    desc: "Write your details and choose your desired course.",
  },
  {
    step: "2",
    title: "Pay Module Fee",
    desc: "Send registration fee on Easypaisa and upload the payment screenshot.",
  },
  {
    step: "3",
    title: "Access Portal",
    desc: "After verification, log in to access live classes, lecture videos, and assignments.",
  },
] as const;
