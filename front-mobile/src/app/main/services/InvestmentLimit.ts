// @main/services/InvestmentLimit.ts

export interface InvestmentLimitData {
  /** Amount already invested this year (TND) */
  investedThisYear: number;
  /** Total annual limit (TND) */
  annualLimit: number;
  /** ISO date when limit renews */
  renewalDate: string;
  /** Asset threshold (USD) to become professional */
  professionalThreshold: number;
}

export async function fetchInvestmentLimitData(): Promise<InvestmentLimitData> {
  // simulate network latency
  return new Promise((resolve) => {
    setTimeout(() => {
      const annualLimit = 367_000;
      const investedThisYear = Math.floor(Math.random() * annualLimit);
      resolve({
        investedThisYear,
        annualLimit,
        renewalDate: "2026-01-01",
        professionalThreshold: 1_000_000,
      });
    }, 300);
  });
}
