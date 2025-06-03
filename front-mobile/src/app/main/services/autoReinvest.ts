import { authStore } from "../../auth/services/authStore";
import API_URL from "../../../shared/constants/api";

// Types for auto-reinvest functionality
export interface AutoReinvestPlan {
  id: number;
  status: "active" | "paused" | "cancelled";
  minimumReinvestAmount: number;
  reinvestPercentage: number;
  theme: "growth" | "income" | "index" | "balanced" | "diversified";
  riskLevel: "low" | "medium" | "high";
  reinvestmentFrequency: "immediate" | "weekly" | "monthly";
  autoApprovalEnabled: boolean;
  maxReinvestPercentagePerProject: number;
  totalRentalIncome: number;
  totalReinvested: number;
  pendingReinvestAmount: number;
  lastReinvestDate?: string;
  preferredRegions?: string[];
  excludedPropertyTypes?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalStats {
  totalRentalIncome: number;
  totalReinvested: number;
  availableToReinvest: number;
  payoutCount: number;
  lastPayoutDate?: string;
}

export interface AutoReinvestData {
  isEligible: boolean;
  totalInvested: number;
  minimumRequired: number;
  autoReinvestPlan?: AutoReinvestPlan;
  rentalStats: RentalStats;
}

export interface RentalPayout {
  id: number;
  userId: number;
  projectId: number;
  amount: number;
  currency: "TND" | "EUR";
  payoutDate: string;
  isReinvested: boolean;
  reinvestedAmount: number;
  status: "pending" | "paid" | "reinvested" | "partially_reinvested";
  notes?: string;
  project?: {
    id: number;
    title: string;
    location: string;
  };
  reinvestTransaction?: {
    id: number;
    amount: number;
    status: string;
    created_at: string;
  };
}

export interface CreateAutoReinvestRequest {
  minimumReinvestAmount?: number;
  reinvestPercentage?: number;
  theme?: "growth" | "income" | "index" | "balanced" | "diversified";
  riskLevel?: "low" | "medium" | "high";
  reinvestmentFrequency?: "immediate" | "weekly" | "monthly";
  autoApprovalEnabled?: boolean;
  maxReinvestPercentagePerProject?: number;
  preferredRegions?: string[];
  excludedPropertyTypes?: string[];
  notes?: string;
}

export interface UpdateAutoReinvestRequest extends CreateAutoReinvestRequest {}

export interface RentalHistoryResponse {
  rentalPayouts: RentalPayout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = authStore.getState().accessToken;
  console.log(
    "[AutoReinvest] Token from authStore:",
    token ? `Token exists (${token.length} chars)` : "No token"
  );

  if (!token) {
    console.log("[AutoReinvest] No token found, using mock token");
    const mockToken = "mock-token-user-6";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mockToken}`,
    };
  }

  // Validate token format (should be a JWT with 3 parts)
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    console.log(
      "[AutoReinvest] Warning: Token doesn't appear to be a JWT format",
      `Parts: ${tokenParts.length}, Token preview: ${token.substring(0, 20)}...`
    );
  }

  // Log token for debugging (first 20 chars only for security)
  console.log(`[AutoReinvest] Using token: ${token.substring(0, 20)}...`);

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  console.log(
    `[AutoReinvest] API Response: ${response.status} ${response.statusText}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.log(`[AutoReinvest] Error Response Body:`, errorText);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    // Handle authentication errors specifically
    if (response.status === 401) {
      console.log(
        "[AutoReinvest] Authentication failed - clearing stored token"
      );
      await authStore.getState().clearTokens();
      throw new Error("Authentication failed. Please log in again.");
    }

    // Handle rate limiting
    if (response.status === 429) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }

    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

/**
 * Get user's auto-reinvest plan and eligibility status
 */
export const getAutoReinvest = async (): Promise<AutoReinvestData> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/autoreinvest`, {
      method: "GET",
      headers,
    });

    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error("Error fetching auto-reinvest data:", error);
    throw error;
  }
};

/**
 * Create a new auto-reinvest plan
 */
export const createAutoReinvest = async (
  planData: CreateAutoReinvestRequest
): Promise<AutoReinvestPlan> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/autoreinvest`, {
      method: "POST",
      headers,
      body: JSON.stringify(planData),
    });

    const data = await handleResponse(response);
    return data.data.autoReinvestPlan;
  } catch (error) {
    console.error("Error creating auto-reinvest plan:", error);
    throw error;
  }
};

/**
 * Update existing auto-reinvest plan
 */
export const updateAutoReinvest = async (
  planData: UpdateAutoReinvestRequest
): Promise<AutoReinvestPlan> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/autoreinvest`, {
      method: "PUT",
      headers,
      body: JSON.stringify(planData),
    });

    const data = await handleResponse(response);
    return data.data.autoReinvestPlan;
  } catch (error) {
    console.error("Error updating auto-reinvest plan:", error);
    throw error;
  }
};

/**
 * Toggle auto-reinvest plan status (pause/resume)
 */
export const toggleAutoReinvest = async (
  action: "pause" | "resume"
): Promise<{ status: string; autoReinvestPlan: Partial<AutoReinvestPlan> }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/autoreinvest/toggle`, {
      method: "POST",
      headers,
      body: JSON.stringify({ action }),
    });

    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error("Error toggling auto-reinvest plan:", error);
    throw error;
  }
};

/**
 * Cancel auto-reinvest plan
 */
export const cancelAutoReinvest = async (): Promise<
  Partial<AutoReinvestPlan>
> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/autoreinvest/cancel`, {
      method: "POST",
      headers,
    });

    const data = await handleResponse(response);
    return data.data.autoReinvestPlan;
  } catch (error) {
    console.error("Error cancelling auto-reinvest plan:", error);
    throw error;
  }
};

/**
 * Get rental income history
 */
export const getRentalHistory = async (
  page: number = 1,
  limit: number = 20
): Promise<RentalHistoryResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/api/autoreinvest/rental-history?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error("Error fetching rental history:", error);
    throw error;
  }
};

/**
 * Process pending reinvestments (admin function)
 */
export const processPendingReinvestments = async (): Promise<{
  processed: number;
  failed: number;
  totalReinvested: number;
  errors: any[];
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/api/autoreinvest/process-pending`,
      {
        method: "POST",
        headers,
      }
    );

    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error("Error processing pending reinvestments:", error);
    throw error;
  }
};

/**
 * Helper function to format currency amounts
 */
export const formatCurrency = (
  amount: number,
  currency: string = "TND"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Helper function to calculate reinvestment projections
 */
export const calculateReinvestmentProjections = (
  currentRentalIncome: number,
  reinvestPercentage: number,
  averageYield: number = 6.5,
  years: number = 5
) => {
  const monthlyReinvestment =
    (currentRentalIncome * reinvestPercentage) / 100 / 12;
  const monthlyRate = averageYield / 100 / 12;

  const projections = [];

  for (let year = 1; year <= years; year++) {
    const months = year * 12;

    // Future value of annuity formula
    const futureValue =
      monthlyReinvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    const totalDeposited = monthlyReinvestment * months;
    const totalReturns = futureValue - totalDeposited;
    const newMonthlyIncome = (futureValue * (averageYield / 100)) / 12;

    projections.push({
      year,
      totalValue: Math.round(futureValue),
      totalDeposited: Math.round(totalDeposited),
      totalReturns: Math.round(totalReturns),
      monthlyIncome: Math.round(newMonthlyIncome),
      cumulativeIncome: Math.round(currentRentalIncome + newMonthlyIncome),
    });
  }

  return projections;
};

/**
 * Helper function to get theme descriptions
 */
export const getThemeDescription = (theme: string): string => {
  const descriptions = {
    growth: "Focus on properties with high appreciation potential",
    income: "Prioritize properties with stable rental yields",
    index: "Diversified approach following market trends",
    balanced: "Mix of growth and income properties",
    diversified: "Spread across different property types and regions",
  };

  return (
    descriptions[theme as keyof typeof descriptions] ||
    "Balanced investment approach"
  );
};

/**
 * Helper function to get risk level descriptions
 */
export const getRiskDescription = (riskLevel: string): string => {
  const descriptions = {
    low: "Conservative investments with stable returns",
    medium: "Balanced risk-reward ratio",
    high: "Higher potential returns with increased risk",
  };

  return (
    descriptions[riskLevel as keyof typeof descriptions] ||
    "Balanced risk approach"
  );
};

/**
 * Helper function to validate auto-reinvest plan data
 */
export const validateAutoReinvestPlan = (
  planData: CreateAutoReinvestRequest
): string[] => {
  const errors: string[] = [];

  if (planData.minimumReinvestAmount !== undefined) {
    if (planData.minimumReinvestAmount < 10) {
      errors.push("Minimum reinvest amount must be at least 10 TND");
    }
  }

  if (planData.reinvestPercentage !== undefined) {
    if (planData.reinvestPercentage < 0 || planData.reinvestPercentage > 100) {
      errors.push("Reinvest percentage must be between 0 and 100");
    }
  }

  if (planData.maxReinvestPercentagePerProject !== undefined) {
    if (
      planData.maxReinvestPercentagePerProject < 1 ||
      planData.maxReinvestPercentagePerProject > 100
    ) {
      errors.push(
        "Max reinvest percentage per project must be between 1 and 100"
      );
    }
  }

  return errors;
};

/**
 * Debug function to test authentication and connection
 */
export const debugAutoReinvestConnection = async (): Promise<{
  hasToken: boolean;
  tokenValid: boolean;
  serverReachable: boolean;
  authWorks: boolean;
  tokenPreview?: string;
  error?: string;
}> => {
  const result: {
    hasToken: boolean;
    tokenValid: boolean;
    serverReachable: boolean;
    authWorks: boolean;
    tokenPreview?: string;
    error?: string;
  } = {
    hasToken: false,
    tokenValid: false,
    serverReachable: false,
    authWorks: false,
  };

  try {
    // Check if token exists
    const token = authStore.getState().accessToken;
    result.hasToken = !!token;

    if (token) {
      result.tokenPreview = token.substring(0, 20) + "...";

      // Validate token format
      const tokenParts = token.split(".");
      result.tokenValid = tokenParts.length === 3;

      console.log(
        `[Debug] Token exists: ${token.length} chars, Valid JWT: ${result.tokenValid}`
      );
    }

    // Test server reachability
    try {
      const healthResponse = await fetch(`${API_URL}/health`);
      result.serverReachable = healthResponse.ok;
      console.log(`[Debug] Server reachable: ${result.serverReachable}`);
    } catch (error) {
      console.log(`[Debug] Server not reachable:`, error);
    }

    // Test authentication
    if (result.hasToken && result.serverReachable) {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/api/autoreinvest`, {
          method: "GET",
          headers,
        });
        result.authWorks = response.ok;
        console.log(
          `[Debug] Auth works: ${result.authWorks}, Status: ${response.status}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`[Debug] Auth error:`, errorText);
        }
      } catch (error) {
        console.log(`[Debug] Auth test failed:`, error);
      }
    }

    return result;
  } catch (error) {
    console.error("[Debug] Connection test failed:", error);
    return {
      ...result,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Test function to verify signin and token storage
 */
export const testSigninAndTokenStorage = async (): Promise<{
  loginSuccess: boolean;
  tokenStored: boolean;
  tokenValid: boolean;
  error?: string;
}> => {
  try {
    console.log("[Test] Testing signin and token storage...");

    // Test login request directly
    const response = await fetch(`${API_URL}/api/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "medaminkraiem101@gmail.com",
        password: "password123",
      }),
    });

    const loginSuccess = response.ok;
    console.log(`[Test] Login success: ${loginSuccess}`);

    if (!loginSuccess) {
      const errorText = await response.text();
      console.log(`[Test] Login failed:`, errorText);
      return {
        loginSuccess: false,
        tokenStored: false,
        tokenValid: false,
        error: errorText,
      };
    }

    const responseData = await response.json();
    console.log(`[Test] Login response keys:`, Object.keys(responseData));

    // Check if accessToken exists
    const hasAccessToken = !!responseData.accessToken;
    console.log(`[Test] Has accessToken: ${hasAccessToken}`);

    if (hasAccessToken) {
      // Store the token like the signin service should
      await authStore
        .getState()
        .setTokens(responseData.accessToken, responseData.refreshToken || "");
      console.log("[Test] Token stored manually");

      // Verify it was stored
      const storedToken = authStore.getState().accessToken;
      const tokenStored = !!storedToken;
      const tokenValid = storedToken
        ? storedToken.split(".").length === 3
        : false;

      console.log(`[Test] Token stored: ${tokenStored}, Valid: ${tokenValid}`);

      return {
        loginSuccess: true,
        tokenStored,
        tokenValid,
      };
    } else {
      return {
        loginSuccess: true,
        tokenStored: false,
        tokenValid: false,
        error: "No accessToken in response",
      };
    }
  } catch (error) {
    console.error("[Test] Signin test failed:", error);
    return {
      loginSuccess: false,
      tokenStored: false,
      tokenValid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
