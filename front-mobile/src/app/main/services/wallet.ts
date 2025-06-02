import { authStore } from "@auth/services/authStore";
import API_URL from "../../../shared/constants/api";

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

const getAuthHeaders = async () => {
  const token = authStore.getState().accessToken;
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

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

/**
 * Fetch user wallet with balances
 */
export const fetchWalletBalance = async (): Promise<WalletBalance> => {
  try {
    const headers = await getAuthHeaders();

    console.log("Fetching wallet from:", `${API_URL}/api/wallet`);
    const response = await fetch(`${API_URL}/api/wallet`, {
      method: "GET",
      headers,
    });

    console.log("Wallet response status:", response.status);
    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Wallet data received:", result);

    if (!result.success || !result.data) {
      throw new Error("Invalid response format");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch wallet balance"
    );
  }
};

/**
 * Fetch transaction history
 */
export const fetchTransactionHistory = async (
  page: number = 1,
  limit: number = 20,
  type?: string,
  status?: string
): Promise<TransactionHistoryResponse> => {
  try {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (type) params.append("type", type);
    if (status) params.append("status", status);

    const url = `${API_URL}/api/wallet/transactions?${params.toString()}`;
    console.log("Fetching transactions from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    console.log("Transactions response status:", response.status);
    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Transactions data received:", result);

    if (!result.success || !result.data) {
      throw new Error("Invalid response format");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch transaction history"
    );
  }
};

/**
 * Deposit funds to wallet
 */
export const depositFunds = async (
  depositData: DepositRequest
): Promise<any> => {
  try {
    const headers = await getAuthHeaders();

    console.log("Making deposit request:", depositData);
    const response = await fetch(`${API_URL}/api/wallet/deposit`, {
      method: "POST",
      headers,
      body: JSON.stringify(depositData),
    });

    console.log("Deposit response status:", response.status);
    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }

      const errorData = await response.json();
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Deposit successful:", result);

    return result;
  } catch (error) {
    console.error("Error making deposit:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to deposit funds"
    );
  }
};

/**
 * Withdraw funds from wallet
 */
export const withdrawFunds = async (
  withdrawData: WithdrawRequest
): Promise<any> => {
  try {
    const headers = await getAuthHeaders();

    console.log("Making withdrawal request:", withdrawData);
    const response = await fetch(`${API_URL}/api/wallet/withdraw`, {
      method: "POST",
      headers,
      body: JSON.stringify(withdrawData),
    });

    console.log("Withdrawal response status:", response.status);
    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }

      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }

        // Handle specific withdrawal errors
        if (response.status === 400) {
          if (errorMessage.toLowerCase().includes("insufficient")) {
            errorMessage = "Insufficient funds for this withdrawal amount.";
          } else if (errorMessage.toLowerCase().includes("amount")) {
            errorMessage =
              "Invalid withdrawal amount. Please check the minimum and maximum limits.";
          } else if (errorMessage.toLowerCase().includes("wallet")) {
            errorMessage = "Wallet not found. Please contact support.";
          }
        } else if (response.status === 404) {
          errorMessage = "Wallet not found. Please contact support.";
        } else if (response.status >= 500) {
          errorMessage =
            "Server temporarily unavailable. Please try again later.";
        }
      } catch (parseError) {
        console.warn("Could not parse error response:", parseError);
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Withdrawal successful:", result);

    if (!result.success) {
      throw new Error(result.message || "Withdrawal failed");
    }

    return result;
  } catch (error) {
    console.error("Error making withdrawal:", error);

    // Re-throw the error with a more user-friendly message if it's a generic error
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to process withdrawal. Please try again.");
    }
  }
};

/**
 * Add rewards to wallet
 */
export const addRewards = async (
  rewardsData: AddRewardsRequest
): Promise<any> => {
  try {
    const headers = await getAuthHeaders();

    console.log("Adding rewards:", rewardsData);
    const response = await fetch(`${API_URL}/api/wallet/rewards`, {
      method: "POST",
      headers,
      body: JSON.stringify(rewardsData),
    });

    console.log("Add rewards response status:", response.status);
    if (!response.ok) {
      if (response.status === 401) {
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }

      const errorData = await response.json();
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Rewards added successfully:", result);

    return result;
  } catch (error) {
    console.error("Error adding rewards:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add rewards"
    );
  }
};
