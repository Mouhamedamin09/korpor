// Investment Service - Integration with Payment System
import API_URL from "@shared/constants/api";
import { authStore } from "@auth/services/authStore";
import {
  createStripePayment,
  createPaymePayment,
  getPaymentStatus,
  type PaymentMethod,
  type CreateStripePaymentRequest,
  type CreatePaymePaymentRequest,
} from "./payment.service";

// Investment Types
export interface CreateInvestmentRequest {
  projectId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  currency?: string;
  userEmail: string;
  walletAddress: string;
  // Payment method specific fields
  note?: string;
  savedPaymentMethodId?: string; // For using saved payment methods
}

export interface InvestmentResponse {
  status: string;
  investment_id: string;
  payment_id: string;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  project_id: string;
  user_address: string;
  // Payment specific data
  payment_data: any;
  instructions?: string[];
  expires_at?: string;
}

export interface Investment {
  id: number;
  project_id: string;
  user_address: string;
  amount: number;
  status: "pending" | "confirmed" | "failed";
  payment_method: PaymentMethod;
  payment_id: string;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestmentSummary {
  total_investments: number;
  total_amount: number;
  confirmed_investments: number;
  confirmed_amount: number;
  pending_investments: number;
  pending_amount: number;
  currency: string;
}

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await authStore.getState().accessToken;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Helper function to get user wallet address
const getUserWalletAddress = async (): Promise<string> => {
  const walletAddress = await AsyncStorage.getItem("walletAddress");
  if (!walletAddress) {
    // Return a mock wallet address for development
    return "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  }
  return walletAddress;
};

// ================================
// INVESTMENT CREATION
// ================================

/**
 * Create investment with Stripe payment
 */
export const createInvestmentWithStripe = async (
  request: CreateInvestmentRequest
): Promise<InvestmentResponse> => {
  try {
    // Create Stripe payment intent
    const stripePayment = await createStripePayment({
      amount: request.amount,
      currency: request.currency || "USD",
      email: request.userEmail,
      walletAddress: request.walletAddress,
      projectId: request.projectId,
    });

    // Store investment record
    const investment = await createInvestmentRecord({
      projectId: request.projectId,
      amount: request.amount,
      paymentMethod: "stripe",
      paymentId: stripePayment.payment_intent_id,
      userAddress: request.walletAddress,
    });

    return {
      status: "success",
      investment_id: investment.id.toString(),
      payment_id: stripePayment.payment_intent_id,
      payment_method: "stripe",
      amount: request.amount,
      currency: stripePayment.currency,
      project_id: request.projectId,
      user_address: request.walletAddress,
      payment_data: {
        client_secret: stripePayment.client_secret,
        customer_id: stripePayment.customer_id,
        test_mode: stripePayment.test_mode,
      },
    };
  } catch (error) {
    console.error("Error creating Stripe investment:", error);
    throw error;
  }
};

/**
 * Create investment with PayMe payment
 */
export const createInvestmentWithPayMe = async (
  request: CreateInvestmentRequest
): Promise<InvestmentResponse> => {
  try {
    // Try to create PayMe payment (will return coming soon message)
    const paymePayment = await createPaymePayment({
      amount: request.amount,
      walletAddress: request.walletAddress,
      note: request.note || `Investment in project ${request.projectId}`,
    });

    // For now, create a pending investment record
    const investment = await createInvestmentRecord({
      projectId: request.projectId,
      amount: request.amount,
      paymentMethod: "payme",
      paymentId: `payme_${Date.now()}`,
      userAddress: request.walletAddress,
    });

    return {
      status: "coming_soon",
      investment_id: investment.id.toString(),
      payment_id: `payme_${Date.now()}`,
      payment_method: "payme",
      amount: request.amount,
      currency: request.currency || "TND",
      project_id: request.projectId,
      user_address: request.walletAddress,
      payment_data: paymePayment,
    };
  } catch (error) {
    console.error("Error creating PayMe investment:", error);
    throw error;
  }
};

/**
 * Universal investment creation - handles all payment methods
 */
export const createInvestment = async (
  request: CreateInvestmentRequest
): Promise<InvestmentResponse> => {
  try {
    switch (request.paymentMethod) {
      case "stripe":
        return await createInvestmentWithStripe(request);
      case "payme":
        return await createInvestmentWithPayMe(request);
      default:
        throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
    }
  } catch (error) {
    console.error("Error creating investment:", error);
    throw error;
  }
};

// ================================
// INVESTMENT RECORD MANAGEMENT
// ================================

/**
 * Create investment record in backend
 */
const createInvestmentRecord = async (data: {
  projectId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentId: string;
  userAddress: string;
}): Promise<Investment> => {
  try {
    const response = await fetch(`${API_URL}/api/investments`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        project_id: data.projectId,
        amount: data.amount,
        payment_method: data.paymentMethod,
        payment_id: data.paymentId,
        user_address: data.userAddress,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to create investment record");
    }
  } catch (error) {
    console.error("Error creating investment record:", error);
    throw error;
  }
};

/**
 * Get investment by ID
 */
export const getInvestmentById = async (
  investmentId: string
): Promise<Investment> => {
  try {
    const response = await fetch(`${API_URL}/api/investments/${investmentId}`, {
      method: "GET",
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
      return result.data;
    } else {
      throw new Error(result.message || "Investment not found");
    }
  } catch (error) {
    console.error("Error getting investment:", error);
    throw error;
  }
};

/**
 * Get investments by user wallet address
 */
export const getInvestmentsByWallet = async (
  walletAddress?: string
): Promise<Investment[]> => {
  try {
    const userWallet = walletAddress || (await getUserWalletAddress());
    const response = await fetch(
      `${API_URL}/api/investments/wallet/${userWallet}`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "No investments found");
    }
  } catch (error) {
    console.error("Error getting investments by wallet:", error);
    // Return empty array for development
    return [];
  }
};

/**
 * Get investments by project ID
 */
export const getInvestmentsByProject = async (
  projectId: string
): Promise<Investment[]> => {
  try {
    const response = await fetch(
      `${API_URL}/api/investments/project/${projectId}`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "No investments found");
    }
  } catch (error) {
    console.error("Error getting investments by project:", error);
    return [];
  }
};

/**
 * Get investment summary for user
 */
export const getInvestmentSummary = async (
  walletAddress?: string
): Promise<InvestmentSummary> => {
  try {
    const userWallet = walletAddress || (await getUserWalletAddress());
    const response = await fetch(
      `${API_URL}/api/investments/summary/${userWallet}`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to get investment summary");
    }
  } catch (error) {
    console.error("Error getting investment summary:", error);
    // Return default summary for development
    return {
      total_investments: 0,
      total_amount: 0,
      confirmed_investments: 0,
      confirmed_amount: 0,
      pending_investments: 0,
      pending_amount: 0,
      currency: "USD",
    };
  }
};

// ================================
// INVESTMENT STATUS TRACKING
// ================================

/**
 * Check investment payment status
 */
export const checkInvestmentPaymentStatus = async (
  paymentId: string
): Promise<{
  investment: Investment;
  payment_status: any;
}> => {
  try {
    // Get payment status from payment service
    const paymentStatus = await getPaymentStatus(paymentId);

    // Get investment record
    const response = await fetch(
      `${API_URL}/api/investments/payment/${paymentId}`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.success) {
      return {
        investment: result.data,
        payment_status: paymentStatus,
      };
    } else {
      throw new Error(result.message || "Investment not found");
    }
  } catch (error) {
    console.error("Error checking investment payment status:", error);
    throw error;
  }
};

/**
 * Update investment status
 */
export const updateInvestmentStatus = async (
  investmentId: string,
  status: "pending" | "confirmed" | "failed",
  txHash?: string
): Promise<Investment> => {
  try {
    const response = await fetch(
      `${API_URL}/api/investments/${investmentId}/status`,
      {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          status,
          tx_hash: txHash,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to update investment status");
    }
  } catch (error) {
    console.error("Error updating investment status:", error);
    throw error;
  }
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Format investment amount for display
 */
export const formatInvestmentAmount = (
  amount: number,
  currency: string
): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
};

/**
 * Get investment status color
 */
export const getInvestmentStatusColor = (status: string): string => {
  const colors = {
    pending: "#FFA500",
    confirmed: "#10B981",
    failed: "#EF4444",
  };

  return colors[status as keyof typeof colors] || "#6B7280";
};

/**
 * Get payment method display info
 */
export const getPaymentMethodDisplayInfo = (method: PaymentMethod) => {
  const info = {
    stripe: {
      name: "Credit/Debit Card",
      icon: "credit-card",
      color: "#635BFF",
    },
    payme: {
      name: "PayMe",
      icon: "smartphone",
      color: "#00D4AA",
    },
  };

  return info[method] || info.stripe;
};

/**
 * Calculate investment ROI projection
 */
export const calculateInvestmentROI = (
  amount: number,
  roiPercentage: number,
  periodMonths: number
): {
  projected_return: number;
  total_value: number;
  monthly_return: number;
} => {
  const annualROI = roiPercentage / 100;
  const monthlyROI = annualROI / 12;
  const totalReturn = amount * (Math.pow(1 + monthlyROI, periodMonths) - 1);
  const totalValue = amount + totalReturn;
  const monthlyReturn = totalReturn / periodMonths;

  return {
    projected_return: totalReturn,
    total_value: totalValue,
    monthly_return: monthlyReturn,
  };
};

/**
 * Validate investment request
 */
export const validateInvestmentRequest = (
  request: CreateInvestmentRequest
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!request.projectId) {
    errors.push("Project ID is required");
  }

  if (!request.amount || request.amount <= 0) {
    errors.push("Valid investment amount is required");
  }

  if (!request.paymentMethod) {
    errors.push("Payment method is required");
  }

  if (!request.userEmail) {
    errors.push("User email is required");
  }

  if (!request.walletAddress) {
    errors.push("Wallet address is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
