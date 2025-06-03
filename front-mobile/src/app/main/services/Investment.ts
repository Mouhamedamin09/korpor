// @main/services/Investment.ts

import { authStore } from "../../auth/services/authStore";
import * as SecureStore from "expo-secure-store";
import API_URL from "../../../shared/constants/api";

export const Investment = {
  // Base configuration
  headers: {
    "Content-Type": "application/json",
  },

  // Get authentication token from SecureStore
  getAuthToken: async (): Promise<string | null> => {
    try {
      await authStore.getState().loadTokens();
      const token = authStore.getState().accessToken;
      console.log(
        "[Investment] Token from authStore:",
        token ? "Token exists" : "No token found"
      );
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  },

  // Helper to get authenticated headers
  getAuthHeaders: async () => {
    const token = await Investment.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  // Get all investments
  getInvestments: async (page = 1, limit = 10) => {
    try {
      const headers = await Investment.getAuthHeaders();

      const response = await fetch(
        `${API_URL}/api/investments?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await authStore.getState().clearTokens();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching investments:", error);
      throw error;
    }
  },

  // Get single investment
  getInvestment: async (id: string) => {
    try {
      const headers = await Investment.getAuthHeaders();

      const response = await fetch(`${API_URL}/api/investments/${id}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          await authStore.getState().clearTokens();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching investment:", error);
      throw error;
    }
  },

  // Create new investment
  createInvestment: async (investmentData: any) => {
    try {
      const headers = await Investment.getAuthHeaders();

      const response = await fetch(`${API_URL}/api/investments`, {
        method: "POST",
        headers,
        body: JSON.stringify(investmentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await authStore.getState().clearTokens();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating investment:", error);
      throw error;
    }
  },

  // Update investment
  updateInvestment: async (id: string, investmentData: any) => {
    try {
      const headers = await Investment.getAuthHeaders();

      const response = await fetch(`${API_URL}/api/investments/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(investmentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await authStore.getState().clearTokens();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating investment:", error);
      throw error;
    }
  },

  // Delete investment
  deleteInvestment: async (id: string) => {
    try {
      const headers = await Investment.getAuthHeaders();

      const response = await fetch(`${API_URL}/api/investments/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          await authStore.getState().clearTokens();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting investment:", error);
      throw error;
    }
  },

  // Store wallet address in SecureStore
  storeWalletAddress: async (walletAddress: string) => {
    try {
      await SecureStore.setItemAsync("walletAddress", walletAddress);
      console.log("✅ Wallet address stored in SecureStore");
    } catch (error) {
      console.error("Error storing wallet address:", error);
      throw error;
    }
  },

  // Retrieve wallet address from SecureStore
  getWalletAddress: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync("walletAddress");
    } catch (error) {
      console.error("Error retrieving wallet address:", error);
      return null;
    }
  },

  // Clear wallet address from SecureStore
  clearWalletAddress: async () => {
    try {
      await SecureStore.deleteItemAsync("walletAddress");
      console.log("✅ Wallet address cleared from SecureStore");
    } catch (error) {
      console.error("Error clearing wallet address:", error);
    }
  },
};

export default Investment;

export interface UserInvestmentData {
  currency: "TND" | "EUR";
  totalInvested: number;
  monthlyContribution: number;
  averageYield: number;
  projectedReturns: {
    year1: number;
    year5: number;
    year10: number;
    year15: number;
  };
}

export interface InvestmentProjection {
  years: number;
  monthlyDeposit: number;
  yieldPct: number;
  currency: "TND" | "EUR";
  projections: Array<{
    year: number;
    totalValue: number;
    monthlyIncome: number;
    totalDeposited: number;
    totalReturns: number;
  }>;
}

export async function fetchUserInvestmentData(): Promise<UserInvestmentData> {
  try {
    const token = await Investment.getAuthToken();

    const response = await fetch(`${API_URL}/investments/user-data`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch investment data");
    }
  } catch (error) {
    console.error("Error fetching investment data:", error);

    // Return fallback data for development
    return {
      currency: "TND",
      totalInvested: 50000,
      monthlyContribution: 6000,
      averageYield: 6.5,
      projectedReturns: {
        year1: 75000,
        year5: 250000,
        year10: 500000,
        year15: 850000,
      },
    };
  }
}

export async function calculateInvestmentProjection(
  monthlyDeposit: number,
  years: number,
  yieldPct: number
): Promise<InvestmentProjection> {
  try {
    const token = await Investment.getAuthToken();

    const response = await fetch(`${API_URL}/investments/projection`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        monthlyDeposit,
        years,
        yieldPct,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to calculate projection");
    }
  } catch (error) {
    console.error("Error calculating projection:", error);

    // Return fallback calculation
    const projections = [];
    let totalDeposited = 0;

    for (let year = 0; year <= years; year++) {
      totalDeposited = monthlyDeposit * 12 * year;
      const compoundValue = totalDeposited * Math.pow(1 + yieldPct / 100, year);
      const totalValue = Math.round(compoundValue);
      const monthlyIncome = Math.round((totalValue * (yieldPct / 100)) / 12);
      const totalReturns = totalValue - totalDeposited;

      projections.push({
        year,
        totalValue,
        monthlyIncome,
        totalDeposited,
        totalReturns,
      });
    }

    return {
      years,
      monthlyDeposit,
      yieldPct,
      currency: "TND",
      projections,
    };
  }
}

export async function getUserCurrency(): Promise<"TND" | "EUR"> {
  try {
    const token = await Investment.getAuthToken();

    const response = await fetch(`${API_URL}/referrals/currency`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data.currency;
    } else {
      throw new Error(result.message || "Failed to fetch currency");
    }
  } catch (error) {
    console.error("Error fetching currency:", error);
    return "TND"; // Default fallback
  }
}
