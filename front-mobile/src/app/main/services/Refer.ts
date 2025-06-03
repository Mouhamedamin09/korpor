// @main/services/Refer.ts

import { authStore } from "../../auth/services/authStore";

const API_URL = "http://192.168.43.44:5000/api"; // Android IP

// Get authentication token from SecureStore
const getAuthToken = async (): Promise<string | null> => {
  try {
    await authStore.getState().loadTokens();
    const token = authStore.getState().accessToken;
    console.log(
      "[Refer] Token from authStore:",
      token ? "Token exists" : "No token found"
    );
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Helper to get authenticated headers
const getAuthHeaders = async () => {
  const token = authStore.getState().accessToken;
  console.log(
    "[Refer] Token from authStore:",
    token ? "Token exists" : "No token found"
  );

  // If no real token, use mock token for development (like other services)
  const finalToken = token || "mock-token-user-1";

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${finalToken}`,
  };
};

const getCurrentUserId = (): number => {
  // For development, hardcode user ID 1
  return 1;
};

export interface ReferralInfo {
  userId: string;
  currency: "TND" | "EUR";
  code: string;
  /** monthly referral bonus */
  referralAmount: number;
  /** minimum investment threshold */
  minInvestment: number;
  stats?: {
    totalReferred: number;
    totalInvested: number;
  };
}

export async function fetchReferralInfo(): Promise<ReferralInfo> {
  try {
    const response = await fetch(`${API_URL}/referrals/info`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch referral info");
    }
  } catch (error) {
    console.error("Error fetching referral info:", error);
    throw error;
  }
}

export async function switchCurrency(
  newCurrency: "TND" | "EUR"
): Promise<ReferralInfo> {
  try {
    const response = await fetch(`${API_URL}/referrals/switch-currency`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ currency: newCurrency }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Fetch updated referral info after currency switch
      return await fetchReferralInfo();
    } else {
      throw new Error(result.message || "Failed to switch currency");
    }
  } catch (error) {
    console.error("Error switching currency:", error);
    throw error;
  }
}

export async function getReferralCode(): Promise<{
  referralCode: string;
  shareLink: string;
}> {
  try {
    const response = await fetch(`${API_URL}/referrals/get-code`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to get referral code");
    }
  } catch (error) {
    console.error("Error getting referral code:", error);
    throw error;
  }
}

export async function getUserCurrency(): Promise<"TND" | "EUR"> {
  try {
    const response = await fetch(`${API_URL}/referrals/currency`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
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
    throw error;
  }
}
