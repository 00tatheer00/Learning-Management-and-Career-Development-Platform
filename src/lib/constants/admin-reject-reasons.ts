export const ADMIN_REJECT_PRESETS = [
  {
    id: "unclear-screenshot",
    label: "Screenshot unclear",
    message:
      "Payment screenshot is unclear. Please register again with a clear Easypaisa payment proof.",
  },
  {
    id: "wrong-amount",
    label: "Wrong amount",
    message:
      "Payment amount is incorrect. The registration fee is PKR 1,000 only. Please pay the correct amount and apply again.",
  },
  {
    id: "duplicate-screenshot",
    label: "Old / duplicate screenshot",
    message:
      "Duplicate or old payment screenshot detected. Please complete a new PKR 1,000 payment and upload a fresh screenshot.",
  },
] as const;
