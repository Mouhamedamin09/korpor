import { authStore } from "@auth/services/authStore";
import API_URL from "../../../shared/constants/api";

export interface AutoInvestPlan {
  id: number;
  monthlyAmount: number;
  currency: "TND" | "EUR";
  theme: "growth" | "income" | "index" | "balanced";
  status: "active" | "paused" | "cancelled";
  depositDay: number;
  lastDepositDate?: string;
  nextDepositDate?: string;
  totalDeposited: number;
  totalInvested: number;
  autoInvestEnabled: boolean;
  riskLevel: "low" | "medium" | "high";
  preferredRegions?: string[];
  excludedPropertyTypes?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutoInvestStats {
  // Basic plan information
  hasActivePlan: boolean;
  status?: "active" | "paused" | "cancelled";
  theme?: "growth" | "income" | "index" | "balanced";
  monthlyAmount?: number;
  currency?: "TND" | "EUR";

  // Financial metrics
  totalDeposited: number;
  totalInvested: number;
  totalReturns: number;
  currentPortfolioValue?: number;

  // Performance metrics
  monthsActive: number;
  averageMonthlyReturn: number;
  projectedAnnualReturn: number;
  returnOnInvestment?: number;
  annualizedReturn?: number;

  // Efficiency metrics
  depositEfficiency?: number;
  cashUtilization?: number;

  // Future projections
  projectedValueIn1Year?: number;

  // Schedule information
  nextDepositDate?: string;
  daysUntilNextDeposit?: number;
  lastDepositDate?: string;

  // Additional metadata
  planCreatedDate?: string;
  totalTransactions?: number;
  investmentCount?: number;
}

export interface CreateAutoInvestRequest {
  monthlyAmount: number;
  theme: "growth" | "income" | "index" | "balanced";
  depositDay: number;
  paymentMethodId?: string;
  riskLevel?: "low" | "medium" | "high";
  preferredRegions?: string[];
  excludedPropertyTypes?: string[];
  notes?: string;
}

export interface UpdateAutoInvestRequest {
  monthlyAmount?: number;
  depositDay?: number;
  paymentMethodId?: string;
  riskLevel?: "low" | "medium" | "high";
  preferredRegions?: string[];
  excludedPropertyTypes?: string[];
  notes?: string;
}

// Helper function to get authentication headers
const getAuthHeaders = async () => {
  const token = (await authStore.getState().accessToken) || "mock-token-user-6";
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * Create a new AutoInvest plan
 */
export async function createAutoInvestPlan(
  data: CreateAutoInvestRequest
): Promise<AutoInvestPlan> {
  try {
    const response = await fetch(`${API_URL}/api/autoinvest`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.success) {
      return result.data.autoInvestPlan;
    } else {
      throw new Error(result.message || "Failed to create AutoInvest plan");
    }
  } catch (error) {
    console.error("Error creating AutoInvest plan:", error);
    throw error;
  }
}

/**
 * Get user's AutoInvest plan
 */
export async function fetchAutoInvestPlan(): Promise<AutoInvestPlan | null> {
  try {
    const headers = await getAuthHeaders();
    console.log("🔍 Fetching AutoInvest plan with headers:", {
      hasAuth: !!headers.Authorization,
      authPreview: headers.Authorization
        ? headers.Authorization.substring(0, 20) + "..."
        : "none",
    });

    const response = await fetch(`${API_URL}/api/autoinvest`, {
      method: "GET",
      headers,
    });

    console.log("📡 AutoInvest API response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("ℹ️ No AutoInvest plan found (404)");
        return null; // No plan exists
      }

      if (response.status === 401) {
        console.error(
          "🔐 Authentication failed (401) - token may be expired or invalid"
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.error(`❌ AutoInvest API error: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log("✅ AutoInvest plan fetched successfully");
      return result.data.autoInvestPlan;
    } else {
      throw new Error(result.message || "Failed to fetch AutoInvest plan");
    }
  } catch (error) {
    console.error("Error fetching AutoInvest plan:", error);
    // Return null for development when backend might not be available
    return null;
  }
}

/**
 * Update AutoInvest plan
 */
export async function updateAutoInvestPlan(
  data: UpdateAutoInvestRequest
): Promise<AutoInvestPlan> {
  try {
    const response = await fetch(`${API_URL}/api/autoinvest`, {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.success) {
      return result.data.autoInvestPlan;
    } else {
      throw new Error(result.message || "Failed to update AutoInvest plan");
    }
  } catch (error) {
    console.error("Error updating AutoInvest plan:", error);
    throw error;
  }
}

/**
 * Pause or resume AutoInvest plan
 */
export async function toggleAutoInvestPlan(
  action: "pause" | "resume"
): Promise<{ status: string; nextDepositDate?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/autoinvest/toggle`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.success) {
      return result.data.autoInvestPlan;
    } else {
      throw new Error(result.message || "Failed to toggle AutoInvest plan");
    }
  } catch (error) {
    console.error("Error toggling AutoInvest plan:", error);
    throw error;
  }
}

/**
 * Cancel AutoInvest plan
 */
export async function cancelAutoInvestPlan(): Promise<{
  status: string;
  totalDeposited: number;
  totalInvested: number;
}> {
  try {
    const response = await fetch(`${API_URL}/api/autoinvest/cancel`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.success) {
      return result.data.autoInvestPlan;
    } else {
      throw new Error(result.message || "Failed to cancel AutoInvest plan");
    }
  } catch (error) {
    console.error("Error cancelling AutoInvest plan:", error);
    throw error;
  }
}

/**
 * Get AutoInvest statistics with comprehensive financial metrics
 */
export async function fetchAutoInvestStats(): Promise<AutoInvestStats> {
  try {
    const headers = await getAuthHeaders();
    console.log("🔍 Fetching AutoInvest statistics with headers:", {
      hasAuth: !!headers.Authorization,
      authPreview: headers.Authorization
        ? headers.Authorization.substring(0, 20) + "..."
        : "none",
    });

    const response = await fetch(`${API_URL}/api/autoinvest/stats`, {
      method: "GET",
      headers,
    });

    console.log("📊 AutoInvest Stats API response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.error(
          "🔐 Authentication failed (401) - token may be expired or invalid"
        );
        throw new Error("Authentication failed");
      }

      console.error(`❌ AutoInvest Stats API error: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log("✅ AutoInvest statistics fetched successfully:", {
        hasActivePlan: result.data.stats.hasActivePlan,
        totalDeposited: result.data.stats.totalDeposited,
        totalReturns: result.data.stats.totalReturns,
        monthsActive: result.data.stats.monthsActive,
      });

      return {
        // Basic plan information
        hasActivePlan: result.data.stats.hasActivePlan || false,
        status: result.data.stats.status,
        theme: result.data.stats.theme,
        monthlyAmount: result.data.stats.monthlyAmount,
        currency: result.data.stats.currency,

        // Financial metrics
        totalDeposited: result.data.stats.totalDeposited || 0,
        totalInvested: result.data.stats.totalInvested || 0,
        totalReturns: result.data.stats.totalReturns || 0,
        currentPortfolioValue: result.data.stats.currentPortfolioValue,

        // Performance metrics
        monthsActive: result.data.stats.monthsActive || 0,
        averageMonthlyReturn: result.data.stats.averageMonthlyReturn || 0,
        projectedAnnualReturn: result.data.stats.projectedAnnualReturn || 0,
        returnOnInvestment: result.data.stats.returnOnInvestment,
        annualizedReturn: result.data.stats.annualizedReturn,

        // Efficiency metrics
        depositEfficiency: result.data.stats.depositEfficiency,
        cashUtilization: result.data.stats.cashUtilization,

        // Future projections
        projectedValueIn1Year: result.data.stats.projectedValueIn1Year,

        // Schedule information
        nextDepositDate: result.data.stats.nextDepositDate,
        daysUntilNextDeposit: result.data.stats.daysUntilNextDeposit,
        lastDepositDate: result.data.stats.lastDepositDate,

        // Additional metadata
        planCreatedDate: result.data.stats.planCreatedDate,
        totalTransactions: result.data.stats.totalTransactions,
        investmentCount: result.data.stats.investmentCount,
      };
    } else {
      throw new Error(
        result.message || "Failed to fetch AutoInvest statistics"
      );
    }
  } catch (error) {
    console.error("Error fetching AutoInvest stats:", error);

    // Return comprehensive fallback stats for development
    console.log("🔄 Returning fallback AutoInvest statistics");
    return {
      // Basic plan information
      hasActivePlan: false,
      status: undefined,
      theme: undefined,
      monthlyAmount: undefined,
      currency: undefined,

      // Financial metrics
      totalDeposited: 0,
      totalInvested: 0,
      totalReturns: 0,
      currentPortfolioValue: 0,

      // Performance metrics
      monthsActive: 0,
      averageMonthlyReturn: 0,
      projectedAnnualReturn: 0,
      returnOnInvestment: 0,
      annualizedReturn: 0,

      // Efficiency metrics
      depositEfficiency: 0,
      cashUtilization: 0,

      // Future projections
      projectedValueIn1Year: 0,

      // Schedule information
      nextDepositDate: undefined,
      daysUntilNextDeposit: undefined,
      lastDepositDate: undefined,

      // Additional metadata
      planCreatedDate: undefined,
      totalTransactions: 0,
      investmentCount: 0,
    };
  }
}
