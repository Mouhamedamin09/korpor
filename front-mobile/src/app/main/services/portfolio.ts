// src/services/portfolio.ts
// ────────────────────────────────────────────────────────────────────────────────
// Temporary “API” layer – returns hard-coded mock data while the real backend
// is under construction. Swap these implementations with real fetch/axios
// calls once endpoints are ready.
// ────────────────────────────────────────────────────────────────────────────────

/** Simulates network latency so the UI loading states can be tested. */
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface PortfolioTotals {
  /** All-time portfolio value in USD (base reporting currency) */
  usd: number;
  /** Same value converted to the user’s preferred local currency */
  local: number;
}

export interface AutomationStatus {
  /** Has the user finished the Auto-Invest onboarding flow? */
  autoInvestSetup: boolean;
  /** Has the user finished the Auto-Reinvest onboarding flow? */
  autoReinvestSetup: boolean;
}

/* ------------------------------------------------------------------ */
/*  Mock fetchers                                                     */
/* ------------------------------------------------------------------ */

/** Returns today’s portfolio value (hard-coded until the backend arrives). */
export async function fetchPortfolioTotals(): Promise<PortfolioTotals> {
  await sleep(350); // fake latency
  return {
    usd: 21_500, // ← replace with API result later
    local: 68_000, // ← converted to TND for now
  };
}

/** Returns whether Auto-Invest / Auto-Reinvest are enabled on the account. */
export async function fetchAutomationStatus(): Promise<AutomationStatus> {
  await sleep(300);
  return {
    autoInvestSetup: false,
    autoReinvestSetup: false,
  };
}
