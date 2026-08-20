/** Official Academy Contact Phone & Details */
export const OFFICIAL_PHONE_NUMBER = "03215919502";
export const OFFICIAL_PHONE_DISPLAY = "+92 321 5919502";

export const FOUNDER_LINKEDIN_URL = "https://linkedin.com/in/tatheer-hussain";
export const FOUNDER_LINKEDIN_DISPLAY = "linkedin.com/in/tatheer-hussain";

export const OFFICIAL_HELP_MESSAGE =
  "Assalam o Alaikum! I need help with registration at Emerging Edge School of Technology.";

export function getOfficialTelHref(): string {
  return `tel:+92${OFFICIAL_PHONE_NUMBER.replace(/^0/, "")}`;
}
