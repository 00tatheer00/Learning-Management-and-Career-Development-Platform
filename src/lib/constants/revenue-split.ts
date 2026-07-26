import { PAYMENT_CONFIG } from "@/lib/constants/payment";
import { getRegistrationPhase } from "@/lib/constants/batch";

export const REVENUE_SPLIT = {
  registrationFee: PAYMENT_CONFIG.registrationFee,
  managementShare: 200,
  trainerShare: 800,
  schoolShare: 0,
  currency: PAYMENT_CONFIG.currency,
} as const;

export interface RevenueSplitItem {
  program?: string | null;
  programSlug?: string | null;
  createdAt?: string | Date | null;
  appliedAt?: string | Date | null;
  reviewedAt?: string | Date | null;
  batch?: string | null;
  level?: string | null;
  module?: string | null;
}

export interface SingleRevenueSplit {
  gross: number;
  management: number;
  trainer: number;
  school: number;
}

export function getRevenueSplitForItem(item: RevenueSplitItem): SingleRevenueSplit {
  const phase = getRegistrationPhase({
    createdAt: item.createdAt || item.reviewedAt || item.appliedAt,
    appliedAt: item.appliedAt,
    batch: item.batch,
    level: item.level,
    module: item.module,
  });

  const program = item.program || item.programSlug || "";

  if (phase === "phase-2") {
    if (program === "artificial-intelligence") {
      return {
        gross: 2000,
        management: 200,
        trainer: 1200,
        school: 600,
      };
    }
    if (program === "app-development") {
      return {
        gross: 1000,
        management: 200,
        trainer: 700,
        school: 100,
      };
    }
    // Default Phase 2 (e.g. web-development)
    return {
      gross: 1000,
      management: 200,
      trainer: 800,
      school: 0,
    };
  }

  // Phase 1 (All courses in Phase 1)
  return {
    gross: 1000,
    management: 200,
    trainer: 800,
    school: 0,
  };
}

export function calculateTotalRevenue(items: RevenueSplitItem[]): SingleRevenueSplit {
  return items.reduce<SingleRevenueSplit>(
    (acc, item) => {
      const split = getRevenueSplitForItem(item);
      acc.gross += split.gross;
      acc.management += split.management;
      acc.trainer += split.trainer;
      acc.school += split.school;
      return acc;
    },
    { gross: 0, management: 0, trainer: 0, school: 0 }
  );
}

export function revenueFromStudents(count: number): SingleRevenueSplit {
  return {
    gross: count * REVENUE_SPLIT.registrationFee,
    management: count * REVENUE_SPLIT.managementShare,
    trainer: count * REVENUE_SPLIT.trainerShare,
    school: count * REVENUE_SPLIT.schoolShare,
  };
}

