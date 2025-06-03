import { authStore } from "../../auth/services/authStore";
import API_URL from "../../../shared/constants/api";
import { apiService } from "../../services/apiService";

export interface WalletBalance {
  id: number;
  userId: number;
  cashBalance: number;
  rewardsBalance: number;
  totalBalance: number;
  currency: "USD" | "EUR" | "TND";
  lastTransactionAt?: string;
}

export interface Transaction {
  id: number;
  type:
    | "deposit"
    | "withdrawal"
    | "reward"
    | "investment"
    | "rent_payout"
    | "referral_bonus";
  amount: number;
  currency: "USD" | "EUR" | "TND";
  status: "pending" | "completed" | "failed" | "cancelled";
  description?: string;
  reference?: string;
  balanceType: "cash" | "rewards";
  metadata?: any;
  processedAt?: string;
  createdAt: string;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DepositRequest {
  amount: number;
  description?: string;
  reference?: string;
}

export interface WithdrawRequest {
  amount: number;
  description?: string;
  reference?: string;
}

export interface AddRewardsRequest {
  amount: number;
  description?: string;
  reference?: string;
  type?: "reward" | "referral_bonus" | "rent_payout";
}

/**
 * Currency exchange rates (base currency: TND)
 */
const EXCHANGE_RATES = {
  TND: 1.0,
  USD: 0.32, // 1 TND = 0.32 USD
  EUR: 0.3, // 1 TND = 0.30 EUR
};

/**
 * Convert amount from TND to target currency
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: "TND" | "USD" | "EUR",
  toCurrency: "TND" | "USD" | "EUR"
): number => {
  if (fromCurrency === toCurrency) return amount;

  // Convert from source currency to TND first
  const amountInTND =
    fromCurrency === "TND" ? amount : amount / EXCHANGE_RATES[fromCurrency];

  // Convert from TND to target currency
  const convertedAmount =
    toCurrency === "TND"
      ? amountInTND
      : amountInTND * EXCHANGE_RATES[toCurrency];

  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
};

/**
 * Get currency symbol for display
 */
export const getCurrencySymbol = (currency: "USD" | "EUR" | "TND"): string => {
  const symbols = {
    USD: "$",
    EUR: "€",
    TND: "TND",
  };
  return symbols[currency];
};

/**
 * Format currency amount with proper conversion and symbol
 */
export const formatBalance = (
  amount: number,
  fromCurrency: "TND" | "USD" | "EUR",
  displayCurrency: "USD" | "EUR" | "TND"
): string => {
  const convertedAmount = convertCurrency(
    amount,
    fromCurrency,
    displayCurrency
  );
  const symbol = getCurrencySymbol(displayCurrency);

  return `${symbol} ${convertedAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
// Get authentication token from SecureStore
const getAuthToken = async (): Promise<string | null> => {
  try {
    await authStore.getState().loadTokens();
    const token = authStore.getState().accessToken;
    console.log(
      "[Wallet] Token from authStore:",
      token ? "Token exists" : "No token found"
    );
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export const getWalletBalance = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("[Wallet] Fetching wallet balance...");

    const response = await fetch(`${API_URL}/api/wallet`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[Wallet] Balance response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("[Wallet] ✅ Balance data received:", result);

    // Return the data property since backend returns {success: true, data: {...}}
    return result.success ? result.data : result;
  } catch (error) {
    console.error("[Wallet] ❌ Error fetching wallet balance:", error);
    throw error;
  }
};

// Export with the alias for backward compatibility
export const fetchWalletBalance = getWalletBalance;

export const getWalletTransactions = async (page = 1, limit = 20) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(
      `[Wallet] Fetching transactions (page ${page}, limit ${limit})...`
    );

    const response = await fetch(
      `${API_URL}/api/wallet/transactions?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("[Wallet] Transactions response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("[Wallet] ✅ Transactions data received:", result);

    // Return the data property since backend returns {success: true, data: {...}}
    return result.success ? result.data : result;
  } catch (error) {
    console.error("[Wallet] ❌ Error fetching wallet transactions:", error);
    throw error;
  }
};

// Export with the alias for backward compatibility
export const fetchTransactionHistory = getWalletTransactions;

export const depositFunds = async (depositRequest: DepositRequest) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(`[Wallet] Depositing ${depositRequest.amount}...`);

    const response = await fetch(`${API_URL}/api/wallet/deposit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: depositRequest.amount,
        description: depositRequest.description,
        reference: depositRequest.reference,
      }),
    });

    console.log("[Wallet] Deposit response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Wallet] ✅ Deposit successful");
    return data;
  } catch (error) {
    console.error("[Wallet] ❌ Error depositing funds:", error);
    throw error;
  }
};

export const withdrawFunds = async (
  amount: number,
  paymentMethod: string,
  destination: string
) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(`[Wallet] Withdrawing ${amount} to ${destination}...`);

    const response = await fetch(`${API_URL}/api/wallet/withdraw`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        paymentMethod,
        destination,
      }),
    });

    console.log("[Wallet] Withdraw response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Wallet] ✅ Withdrawal successful");
    return data;
  } catch (error) {
    console.error("[Wallet] ❌ Error withdrawing funds:", error);
    throw error;
  }
};

export const getPaymentMethods = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("[Wallet] Fetching payment methods...");

    const response = await fetch(`${API_URL}/api/wallet/payment-methods`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[Wallet] Payment methods response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Wallet] ✅ Payment methods data received");
    return data;
  } catch (error) {
    console.error("[Wallet] ❌ Error fetching payment methods:", error);
    throw error;
  }
};

export const addPaymentMethod = async (paymentData: any) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("[Wallet] Adding payment method...");

    const response = await fetch(`${API_URL}/api/wallet/payment-methods`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    console.log(
      "[Wallet] Add payment method response status:",
      response.status
    );

    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Wallet] ✅ Payment method added successfully");
    return data;
  } catch (error) {
    console.error("[Wallet] ❌ Error adding payment method:", error);
    throw error;
  }
};
