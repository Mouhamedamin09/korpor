/**
 * Data shape for potential income projection
 */
export interface PIncomeData {
  /** Monthly deposit amount in AED */
  deposit: number;
  /** Number of years for projection (1 | 5 | 10 | 15) */
  years: number;
  /** Net yield percentage */
  yieldPct: number;
  /** Array of projected portfolio values for each year from 0 to years */
  projections: number[];
}

/**
 * Fake data placeholder until real API is available
 */
const fakePIncomeData: PIncomeData = {
  deposit: 6000,
  years: 15,
  yieldPct: 6,
  projections: Array.from({ length: 16 }, (_, i) =>
    Math.round(500_000 * Math.pow(1 + 6 / 100, i) + 6000 * 12 * i)
  ),
};

/**
 * Simulates fetching projected income data from an API
 */
export async function fetchPIncomeData(): Promise<PIncomeData> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(fakePIncomeData), 500)
  );
}
