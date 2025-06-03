// src/services/portfolio.ts
// ────────────────────────────────────────────────────────────────────────────────
// Portfolio service for fetching portfolio data from the backend
// ────────────────────────────────────────────────────────────────────────────────

import { authStore } from "../../auth/services/authStore";
import API_URL from "../../../shared/constants/api";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface PortfolioTotals {
  /** All-time portfolio value in USD (base reporting currency) */
  usd: number;
  /** Same value converted to the user's preferred local currency */
  local: number;
  /** User's preferred currency code */
  currency: string;
  /** Total amount invested */
  totalInvested: number;
  /** Total returns earned */
  totalReturns: number;
  /** Current monthly income from investments */
  monthlyIncome: number;
  /** Average yield percentage */
  averageYield: number;
}

export interface AutomationStatus {
  /** Has the user finished the Auto-Invest onboarding flow? */
  autoInvestSetup: boolean;
  /** Has the user finished the Auto-Reinvest onboarding flow? */
  autoReinvestSetup: boolean;
  /** AutoInvest plan details if configured */
  autoInvestDetails?: {
    id: number;
    monthlyAmount: number;
    theme: string;
    status: string;
    depositDay: number;
    nextDepositDate?: string;
    currency: string;
  };
  /** AutoReinvest settings if configured */
  autoReinvestDetails?: any;
}

export interface PortfolioPerformance {
  period: string;
  totalInvested: number;
  totalReturns: number;
  portfolioValue: number;
  returnPercentage: number;
  history: Array<{
    date: string;
    type: string;
    amount: number;
    cumulativeInvested: number;
    cumulativeReturns: number;
    portfolioValue: number;
  }>;
}

export interface PortfolioProjection {
  currentPortfolioValue: number;
  monthlyDeposit: number;
  years: number;
  yieldPct: number;
  currency: string;
  projections: Array<{
    year: number;
    totalValue: number;
    monthlyIncome: number;
    totalDeposited: number;
    totalReturns: number;
    returnPercentage: number;
  }>;
}

/* ------------------------------------------------------------------ */
/*  API Helper Functions                                              */
/* ------------------------------------------------------------------ */

const getAuthHeaders = async () => {
  const token = authStore.getState().accessToken || "mock-token-user-6";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* ------------------------------------------------------------------ */
/*  API Functions                                                     */
/* ------------------------------------------------------------------ */

/** Returns today's portfolio value and performance metrics. */
export async function fetchPortfolioTotals(): Promise<PortfolioTotals> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/totals`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required");
      }
      throw new Error(`Failed to fetch portfolio totals: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch portfolio totals");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching portfolio totals:", error);

    // Return fallback data if API fails
    return {
      usd: 0,
      local: 0,
      currency: "TND",
      totalInvested: 0,
      totalReturns: 0,
      monthlyIncome: 0,
      averageYield: 6.5,
    };
  }
}

/** Returns whether Auto-Invest / Auto-Reinvest are enabled on the account. */
export async function fetchAutomationStatus(): Promise<AutomationStatus> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/automation`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required");
      }
      throw new Error(`Failed to fetch automation status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch automation status");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching automation status:", error);

    // Return fallback data if API fails
    return {
      autoInvestSetup: false,
      autoReinvestSetup: false,
    };
  }
}

/** Returns detailed portfolio performance metrics for a specific period. */
export async function fetchPortfolioPerformance(
  period: "1M" | "3M" | "6M" | "1Y" | "ALL" = "ALL"
): Promise<PortfolioPerformance> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/api/portfolio/performance?period=${period}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required");
      }
      throw new Error(
        `Failed to fetch portfolio performance: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch portfolio performance");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching portfolio performance:", error);

    // Return fallback data if API fails
    return {
      period,
      totalInvested: 0,
      totalReturns: 0,
      portfolioValue: 0,
      returnPercentage: 0,
      history: [],
    };
  }
}

/** Calculates portfolio growth projection based on monthly deposits. */
export async function calculatePortfolioProjection(
  monthlyDeposit: number,
  years: number,
  yieldPct: number
): Promise<PortfolioProjection> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/projection`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        monthlyDeposit,
        years,
        yieldPct,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required");
      }
      throw new Error(
        `Failed to calculate portfolio projection: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.message || "Failed to calculate portfolio projection"
      );
    }

    return data.data;
  } catch (error) {
    console.error("Error calculating portfolio projection:", error);

    // Return fallback data if API fails - simplified calculation
    const projections = [];
    for (let year = 0; year <= years; year++) {
      const totalDeposited = monthlyDeposit * 12 * year;
      const totalValue = totalDeposited * Math.pow(1 + yieldPct / 100, year);
      const totalReturns = totalValue - totalDeposited;
      const monthlyIncome = Math.round((totalValue * (yieldPct / 100)) / 12);

      projections.push({
        year,
        totalValue: Math.round(totalValue),
        monthlyIncome,
        totalDeposited: Math.round(totalDeposited),
        totalReturns: Math.round(totalReturns),
        returnPercentage:
          totalDeposited > 0
            ? Math.round((totalReturns / totalDeposited) * 100)
            : 0,
      });
    }

    return {
      currentPortfolioValue: 0,
      monthlyDeposit,
      years,
      yieldPct,
      currency: "TND",
      projections,
    };
  }
}
