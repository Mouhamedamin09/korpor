// @main/services/Refer.ts

export interface ReferralInfo {
  userId: string;
  currency: "TND" | "EUR";
  code: string;
  /** monthly referral bonus */
  referralAmount: number;
  /** minimum investment threshold */
  minInvestment: number;
}

// fake data until real API
const fakeReferral: ReferralInfo = {
  userId: "ZINA21",
  currency: "TND",
  code: "Zina",
  referralAmount: 5,
  minInvestment: 2000,
};

export async function fetchReferralInfo(): Promise<ReferralInfo> {
  // simulate network latency
  return new Promise((resolve) => setTimeout(() => resolve(fakeReferral), 300));
}
