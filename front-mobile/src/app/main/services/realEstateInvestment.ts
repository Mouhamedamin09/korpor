import { authStore } from "../../auth/services/authStore";
import { apiService } from "../../services/apiService";

const API_URL = "http://192.168.43.44:5000/api";

// Auth utilities - using expo-secure-store + zustand only
const getAuthToken = async (): Promise<string | null> => {
  try {
    console.log("[RealEstateInvestment] Getting auth token...");

    // Load tokens from SecureStore
    await authStore.getState().loadTokens();
    let token = authStore.getState().accessToken;
    console.log("[RealEstateInvestment] AuthStore token after loading:", {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "null",
    });

    if (!token) {
      console.warn("[RealEstateInvestment] No token found in SecureStore");
      throw new Error("Authentication required - please login");
    }

    // Validate token format (should be a JWT with 3 parts)
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      console.error("[RealEstateInvestment] Invalid token format:", {
        parts: tokenParts.length,
        preview: token.substring(0, 20),
      });
      throw new Error("Invalid authentication token - please login again");
    }

    console.log("[RealEstateInvestment] ✅ Valid token found");
    return token;
  } catch (error) {
    console.error("[RealEstateInvestment] Error getting auth token:", error);
    throw error;
  }
};

// Interfaces
export interface PropertyInvestmentDetails {
  property: {
    id: number;
    name: string;
    description: string;
    location: string;
    goalAmount: number;
    currentAmount: number;
    totalInvested: number;
    remainingAmount: number;
    investmentProgress: number;
    minimumInvestment: number;
    expectedRoi: number;
    rentalYield: number;
    investmentPeriod: number;
    propertyType: string;
    status: string;
    propertyStatus: string;
    isFullyFunded: boolean;
  };
  investment: {
    hasInvested: boolean;
    previousAmount: number;
    canInvestMore: boolean;
  };
  wallet: {
    balance: number;
    currency: string;
  };
}

export interface InvestmentValidation {
  amount: number;
  paymentMethod: string;
  property: {
    id: number;
    name: string;
    remainingAmount: number;
  };
}

export interface Investment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  investmentDate?: string;
  createdAt: string;
  property: {
    id: number;
    name: string;
    location: string;
    property_type: string;
    expected_roi: number;
    rental_yield: number;
    image_url?: string;
  };
  transaction?: {
    id: number;
    reference: string;
    processedAt: string;
  };
}

export interface UserInvestments {
  investments: Investment[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface InvestmentDetails {
  investment: {
    id: number;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    investmentDate?: string;
    userShare: number;
    estimatedMonthlyReturn: number;
  };
  property: any;
  transaction?: any;
}

export interface CreateInvestmentRequest {
  projectId: number;
  amount: number;
  paymentMethod?: "wallet" | "card" | "bank_transfer";
}

export interface CreateInvestmentResponse {
  investment: {
    id: number;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    investmentDate?: string;
  };
  property: {
    id: number;
    name: string;
    currentAmount: number;
    remainingAmount: number;
    isFullyFunded: boolean;
  };
  transaction?: {
    id: number;
    amount: number;
    newBalance: number;
  };
  paymentRequired?: boolean;
}

// API Functions

/**
 * Get property details for investment
 */
export async function getPropertyForInvestment(
  projectId: number
): Promise<PropertyInvestmentDetails> {
  try {
    console.log(
      `[RealEstateInvestment] Fetching property ${projectId} for investment...`
    );

    const token = await getAuthToken();

    const response = await fetch(
      `${API_URL}/real-estate-investment/property/${projectId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("[RealEstateInvestment] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.log(
          "[RealEstateInvestment] Authentication failed, clearing tokens"
        );
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }

      // Log the response text for better debugging
      const responseText = await response.text();
      console.error(
        "[RealEstateInvestment] Server error response:",
        responseText
      );
      throw new Error(`Server error: ${response.status} - ${responseText}`);
    }

    const result = await response.json();
    console.log("[RealEstateInvestment] ✅ Property investment data received");

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch property details");
    }
  } catch (error) {
    console.error("Error fetching property for investment:", error);
    throw error;
  }
}

/**
 * Validate investment before creating
 */
export async function validateInvestment(
  projectId: number,
  amount: number,
  paymentMethod: string = "wallet"
): Promise<InvestmentValidation> {
  try {
    console.log(
      `[RealEstateInvestment] Validating investment: ${amount} for project ${projectId}`
    );

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/real-estate-investment/validate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
        amount,
        paymentMethod,
      }),
    });

    console.log(
      "[RealEstateInvestment] Validation response status:",
      response.status
    );

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("[RealEstateInvestment] ✅ Investment validation completed");

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Investment validation failed");
    }
  } catch (error) {
    console.error("Error validating investment:", error);
    throw error;
  }
}

/**
 * Create investment with wallet payment
 */
export async function createInvestment(
  investmentData: CreateInvestmentRequest
): Promise<CreateInvestmentResponse> {
  try {
    console.log(`[RealEstateInvestment] Creating investment:`, investmentData);

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/real-estate-investment/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(investmentData),
    });

    console.log(
      "[RealEstateInvestment] Create investment response status:",
      response.status
    );

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("[RealEstateInvestment] ✅ Investment created successfully");

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to create investment");
    }
  } catch (error) {
    console.error("Error creating investment:", error);
    throw error;
  }
}

/**
 * Create investment with external payment
 */
export async function createInvestmentWithPayment(
  investmentData: CreateInvestmentRequest
): Promise<CreateInvestmentResponse> {
  try {
    console.log(
      `[RealEstateInvestment] Creating investment with payment:`,
      investmentData
    );

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${API_URL}/real-estate-investment/create-with-payment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(investmentData),
      }
    );

    console.log(
      "[RealEstateInvestment] Create investment with payment response status:",
      response.status
    );

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log(
      "[RealEstateInvestment] ✅ Investment with payment created successfully"
    );

    if (result.success) {
      return result.data;
    } else {
      throw new Error(
        result.message || "Failed to create investment with payment"
      );
    }
  } catch (error) {
    console.error("Error creating investment with payment:", error);
    throw error;
  }
}

/**
 * Get user's investments
 */
export async function getUserInvestments(
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<UserInvestments> {
  try {
    console.log(
      `[RealEstateInvestment] Fetching user investments (page ${page}, limit ${limit})`
    );

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      queryParams.append("status", status);
    }

    const response = await fetch(
      `${API_URL}/real-estate-investment/user/investments?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "[RealEstateInvestment] Get user investments response status:",
      response.status
    );

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("[RealEstateInvestment] ✅ User investments data received");

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch user investments");
    }
  } catch (error) {
    console.error("Error fetching user investments:", error);
    throw error;
  }
}

/**
 * Get investment details
 */
export async function getInvestmentDetails(
  investmentId: number
): Promise<InvestmentDetails> {
  try {
    console.log(
      `[RealEstateInvestment] Fetching investment details for ID: ${investmentId}`
    );

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${API_URL}/real-estate-investment/investment/${investmentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "[RealEstateInvestment] Get investment details response status:",
      response.status
    );

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("[RealEstateInvestment] ✅ Investment details received");

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch investment details");
    }
  } catch (error) {
    console.error("Error fetching investment details:", error);
    throw error;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "TND"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate investment progress percentage
 */
export function calculateProgress(current: number, goal: number): number {
  return Math.min((current / goal) * 100, 100);
}

/**
 * Calculate estimated monthly return
 */
export function calculateMonthlyReturn(
  amount: number,
  yieldPercentage: number
): number {
  return (amount * yieldPercentage) / 100 / 12;
}

/**
 * Validate investment amount
 */
export function validateInvestmentAmount(
  amount: number,
  minimumInvestment: number,
  walletBalance: number,
  remainingAmount: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (amount <= 0) {
    errors.push("Investment amount must be greater than 0");
  }

  if (amount < minimumInvestment) {
    errors.push(`Minimum investment is ${formatCurrency(minimumInvestment)}`);
  }

  if (amount > walletBalance) {
    errors.push("Insufficient wallet balance");
  }

  if (amount > remainingAmount) {
    errors.push(
      `Amount exceeds remaining funding needed (${formatCurrency(
        remainingAmount
      )})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
