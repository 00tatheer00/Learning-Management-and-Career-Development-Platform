import { PAYMENT_CONFIG } from "@/lib/constants/payment";

export const REVENUE_SPLIT = {
  registrationFee: PAYMENT_CONFIG.registrationFee,
  managementShare: 200,
  trainerShare: 800,
  currency: PAYMENT_CONFIG.currency,
} as const;

export function revenueFromStudents(count: number) {
  return {
    gross: count * REVENUE_SPLIT.registrationFee,
    management: count * REVENUE_SPLIT.managementShare,
    trainer: count * REVENUE_SPLIT.trainerShare,
  };
}
