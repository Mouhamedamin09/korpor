// Payment Service - Integration with Backend Payment System
import API_URL from "@shared/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Payment Method Types
export type PaymentMethod = "stripe" | "payme";

export interface PaymentMethodInfo {
  name: string;
  description: string;
  enabled: boolean;
  test_mode?: boolean;
  supported_currencies?: string[];
  processing_time?: string;
  fees?: string;
  features_planned?: string[];
}

export interface PaymentMethods {
  stripe: PaymentMethodInfo;
  payme: PaymentMethodInfo;
}

// Stripe Payment Types
export interface CreateStripePaymentRequest {
  amount: number;
  currency?: string;
  email: string;
  name?: string;
  walletAddress: string;
  projectId?: string;
}

export interface StripePaymentResponse {
  status: string;
  payment_method: string;
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  customer_id: string;
  test_mode: boolean;
}

export interface StripeSetupIntentRequest {
  email: string;
  name?: string;
  walletAddress: string;
}

export interface StripeSetupIntentResponse {
  status: string;
  payment_method: string;
  client_secret: string;
  setup_intent_id: string;
  customer_id: string;
  test_mode: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  type: "stripe" | "payme";
  stripe_payment_method_id?: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  payme?: {
    phone_number: string;
    account_name: string;
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface StripeTestCards {
  test_mode: boolean;
  message: string;
  cards: {
    visa: string;
    visaDebit: string;
    mastercard: string;
    amex: string;
    declined: string;
    insufficientFunds: string;
  };
  instructions: string[];
}

// PayMe Payment Types
export interface CreatePaymePaymentRequest {
  amount: number;
  walletAddress: string;
  note?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  projectId?: string;
}

export interface PaymePaymentResponse {
  status: string;
  payment_method: string;
  message: string;
  token: string;
  order_id: string;
  payment_url: string;
  amount: number;
  currency: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  note: string;
  test_credentials: {
    phone: string;
    password: string;
  };
  instructions: string[];
}

export interface PaymePaymentStatusRequest {
  token: string;
}

export interface PaymePaymentStatusResponse {
  status: string;
  payment: {
    token: string;
    order_id: string;
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed";
    created_at: string;
    completed_at?: string;
    transaction_id?: number;
    received_amount?: number;
    transaction_fee?: number;
  };
}

// Add PayMe Account Save Types
export interface SavePaymeAccountRequest {
  phone_number: string;
  account_name: string;
  walletAddress: string;
}

export interface SavePaymeAccountResponse {
  status: string;
  account_id: string;
  message: string;
}

// Payment Status Types
export interface PaymentStatus {
  status: string;
  payment: {
    id: number;
    payment_id: string;
    payment_method: PaymentMethod;
    amount: number;
    currency: string;
    status:
      | "pending"
      | "confirmed"
      | "failed"
      | "expired"
      | "cancelled"
      | "refunded";
    user_address: string;
    project_id: number | null;
    created_at: string;
    updated_at: string;
  };
}

// Add PayMe Deposit Types
export interface CreatePaymeDepositRequest {
  amount: number;
  walletAddress: string;
  note?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface PaymeDepositResponse {
  status: string;
  payment_method: string;
  message: string;
  token: string;
  order_id: string;
  payment_url: string;
  amount: number;
  currency: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  note: string;
  test_credentials: {
    phone: string;
    password: string;
  };
  instructions: string[];
}

// Add PayMe Withdrawal Types
export interface CreatePaymeWithdrawalRequest {
  amount: number;
  walletAddress: string;
  note?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bank_account?: {
    account_number: string;
    bank_name: string;
    account_holder: string;
  };
}

export interface PaymeWithdrawalResponse {
  status: string;
  message: string;
  withdrawal_id: string;
  amount: number;
  currency: string;
  processing_time: string;
  fees: number;
  net_amount: number;
  bank_account: {
    account_number: string;
    bank_name: string;
    account_holder: string;
  };
}

// Add PayMe Refund Types
export interface CreatePaymeRefundRequest {
  original_payment_token: string;
  amount?: number; // If not provided, full refund
  reason?: string;
  walletAddress: string;
}

export interface PaymeRefundResponse {
  status: string;
  message: string;
  refund_id: string;
  original_payment_token: string;
  refund_amount: number;
  currency: string;
  processing_time: string;
  refund_status: "pending" | "completed" | "failed";
}

// Helper function to get authentication headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    // Try to get user ID from profile first (since profile call is working)
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        const profileResponse = await fetch(`${API_URL}/api/user/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.userId || profileData.id) {
            // Use x-user-id header for payment endpoints since they expect it
            headers["x-user-id"] = String(profileData.userId || profileData.id);
            console.log(`Using user ID from profile: ${headers["x-user-id"]}`);
            return headers;
          }
        }
      }
    } catch (profileError) {
      console.log("Could not fetch profile for user ID:", profileError);
    }

    // Fallback to test user for development
    headers["x-user-id"] = "test_user_123";
    console.log("Using fallback test authentication headers");
    return headers;
  } catch (error) {
    console.error("Error getting auth headers:", error);
    // Fallback to test user for development
    headers["x-user-id"] = "test_user_123";
    return headers;
  }
};

// ================================
// PAYMENT METHOD MANAGEMENT
// ================================

/**
 * Get all available payment methods
 */
export const getPaymentMethods = async (): Promise<PaymentMethods> => {
  try {
    const response = await fetch(`${API_URL}/api/payment/methods`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      return {
        stripe: result.payment_methods.stripe,
        payme: result.payment_methods.payme,
      };
    } else {
      throw new Error("Failed to fetch payment methods");
    }
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw error;
  }
};

// ================================
// SAVED PAYMENT METHODS
// ================================

/**
 * Get all saved payment methods for user
 */
export const getSavedPaymentMethods = async (): Promise<
  SavedPaymentMethod[]
> => {
  try {
    const response = await fetch(`${API_URL}/api/payment/saved-methods`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    // Handle 404 - endpoint not implemented yet
    if (response.status === 404) {
      console.log(
        "Saved payment methods endpoint not implemented yet, returning empty array"
      );
      return [];
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      return result.payment_methods;
    } else {
      throw new Error("Failed to fetch saved payment methods");
    }
  } catch (error) {
    console.error("Error fetching saved payment methods:", error);
    // Return empty array for any errors (including network errors)
    return [];
  }
};

/**
 * Save a Stripe payment method
 */
export const saveStripePaymentMethod = async (
  setupIntentId: string,
  isDefault: boolean = false
): Promise<SavedPaymentMethod> => {
  try {
    const response = await fetch(`${API_URL}/api/payment/stripe/save-method`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        setup_intent_id: setupIntentId,
        is_default: isDefault,
      }),
    });

    // Handle 404 - endpoint not implemented yet
    if (response.status === 404) {
      console.log("Save payment method endpoint not implemented yet");
      throw new Error(
        "Payment method saving is not available yet. Backend endpoint needs to be implemented."
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.status === "success") {
      return result.payment_method;
    } else {
      throw new Error(result.message || "Failed to save payment method");
    }
  } catch (error) {
    console.error("Error saving Stripe payment method:", error);
    throw error;
  }
};

/**
 * Save a PayMe account
 */
export const savePaymeAccount = async (
  request: SavePaymeAccountRequest
): Promise<SavedPaymentMethod> => {
  try {
    const response = await fetch(`${API_URL}/api/payment/payme/save-account`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.status === "success") {
      return result.payment_method;
    } else {
      throw new Error(result.message || "Failed to save PayMe account");
    }
  } catch (error) {
    console.error("Error saving PayMe account:", error);
    throw error;
  }
};

/**
 * Delete a saved payment method
 */
export const deleteSavedPaymentMethod = async (
  paymentMethodId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_URL}/api/payment/saved-methods/${paymentMethodId}`,
      {
        method: "DELETE",
        headers: await getAuthHeaders(),
      }
    );

    // Handle 404 - endpoint not implemented yet
    if (response.status === 404) {
      console.log("Delete payment method endpoint not implemented yet");
      throw new Error(
        "Payment method deletion is not available yet. Backend endpoint needs to be implemented."
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.status !== "success") {
      throw new Error(result.message || "Failed to delete payment method");
    }
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw error;
  }
};

/**
 * Set default payment method
 */
export const setDefaultPaymentMethod = async (
  paymentMethodId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_URL}/api/payment/saved-methods/${paymentMethodId}/default`,
      {
        method: "PUT",
        headers: await getAuthHeaders(),
      }
    );

    // Handle 404 - endpoint not implemented yet
    if (response.status === 404) {
      console.log("Set default payment method endpoint not implemented yet");
      throw new Error(
        "Setting default payment method is not available yet. Backend endpoint needs to be implemented."
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.status !== "success") {
      throw new Error(result.message || "Failed to set default payment method");
    }
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw error;
  }
};

// ================================
// STRIPE PAYMENTS (TEST MODE)
// ================================

/**
 * Create Stripe payment intent
 */
export const createStripePayment = async (
  request: CreateStripePaymentRequest
): Promise<StripePaymentResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/api/payment/stripe/payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.status === "success") {
      return result;
    } else {
      throw new Error(result.message || "Failed to create Stripe payment");
    }
  } catch (error) {
    console.error("Error creating Stripe payment:", error);
    throw error;
  }
};

/**
 * Create Stripe setup intent for saving cards
 */
export const createStripeSetupIntent = async (
  request: StripeSetupIntentRequest
): Promise<StripeSetupIntentResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/payment/stripe/setup-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    // Handle 404 - endpoint not implemented yet
    if (response.status === 404) {
      console.log("Stripe setup intent endpoint not implemented yet");
      throw new Error(
        "Card saving is not available yet. Backend Stripe integration needs to be implemented."
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.status === "success") {
      return result;
    } else {
      throw new Error(result.message || "Failed to create Stripe setup intent");
    }
  } catch (error) {
    console.error("Error creating Stripe setup intent:", error);
    throw error;
  }
};

/**
 * Get Stripe test cards (development helper)
 */
export const getStripeTestCards = async (): Promise<StripeTestCards> => {
  try {
    const response = await fetch(`${API_URL}/api/payment/stripe/test-cards`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting Stripe test cards:", error);
    throw error;
  }
};

/**
 * Create payment with saved Stripe method
 */
export const createPaymentWithSavedStripeMethod = async (
  savedMethodId: string,
  amount: number,
  currency: string = "USD"
): Promise<StripePaymentResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/api/payment/stripe/payment-with-saved`,
      {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          saved_method_id: savedMethodId,
          amount,
          currency,
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

    if (result.status === "success") {
      return result;
    } else {
      throw new Error(result.message || "Failed to create payment");
    }
  } catch (error) {
    console.error("Error creating payment with saved method:", error);
    throw error;
  }
};

// ================================
// PAYME PAYMENTS (NOW LIVE)
// ================================

/**
 * Create PayMe payment with real API integration
 */
export const createPaymePayment = async (
  request: CreatePaymePaymentRequest
): Promise<PaymePaymentResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/payment/payme/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.status === "success") {
      return result;
    } else {
      throw new Error(result.message || "Failed to create PayMe payment");
    }
  } catch (error) {
    console.error("Error creating PayMe payment:", error);
    throw error;
  }
};

/**
 * Check PayMe payment status by token
 */
export const checkPaymePaymentStatus = async (
  token: string
): Promise<PaymePaymentStatusResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/api/payment/payme/status/${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.status === "success") {
      return result;
    } else {
      throw new Error(result.message || "Failed to check payment status");
    }
  } catch (error) {
    console.error("Error checking PayMe payment status:", error);
    throw error;
  }
};

export const createPaymeDeposit = async (
  request: CreatePaymeDepositRequest
): Promise<PaymeDepositResponse> => {
  try {
    console.log("Creating PayMe deposit:", request);
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/payment/payme/deposit`, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    console.log("PayMe deposit response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("PayMe deposit created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating PayMe deposit:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create PayMe deposit"
    );
  }
};

export const createPaymeWithdrawal = async (
  request: CreatePaymeWithdrawalRequest
): Promise<PaymeWithdrawalResponse> => {
  try {
    console.log("Creating PayMe withdrawal:", request);
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/payment/payme/withdrawal`, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    console.log("PayMe withdrawal response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("PayMe withdrawal created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating PayMe withdrawal:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create PayMe withdrawal"
    );
  }
};

export const createPaymeRefund = async (
  request: CreatePaymeRefundRequest
): Promise<PaymeRefundResponse> => {
  try {
    console.log("Creating PayMe refund:", request);
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/payment/payme/refund`, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    console.log("PayMe refund response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("PayMe refund created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating PayMe refund:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create PayMe refund"
    );
  }
};

// ================================
// GENERAL PAYMENT FUNCTIONS
// ================================

/**
 * Get payment status by reference
 */
export const getPaymentStatus = async (
  paymentRef: string
): Promise<PaymentStatus> => {
  try {
    const response = await fetch(
      `${API_URL}/api/payment/status/${paymentRef}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.status === "success") {
      return result;
    } else {
      throw new Error(result.message || "Payment not found");
    }
  } catch (error) {
    console.error("Error getting payment status:", error);
    throw error;
  }
};

/**
 * Get all payments by wallet address
 */
export const getPaymentsByWallet = async (
  walletAddress: string
): Promise<PaymentStatus["payment"][]> => {
  try {
    const response = await fetch(
      `${API_URL}/api/payment/wallet/${walletAddress}`,
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

    if (result.status === "success") {
      return result.payments;
    } else {
      throw new Error(result.message || "No payments found");
    }
  } catch (error) {
    console.error("Error getting payments by wallet:", error);
    throw error;
  }
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Format payment amount for display
 */
export const formatPaymentAmount = (
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
 * Get payment method display name
 */
export const getPaymentMethodDisplayName = (method: PaymentMethod): string => {
  const names = {
    stripe: "Credit/Debit Card",
    payme: "PayMe",
  };

  return names[method] || method;
};

/**
 * Get payment status color
 */
export const getPaymentStatusColor = (status: string): string => {
  const colors = {
    pending: "#FFA500",
    confirmed: "#10B981",
    failed: "#EF4444",
    expired: "#6B7280",
    cancelled: "#6B7280",
    refunded: "#3B82F6",
  };

  return colors[status as keyof typeof colors] || "#6B7280";
};

/**
 * Get payment method icon
 */
export const getPaymentMethodIcon = (type: string): string => {
  const icons = {
    stripe: "credit-card",
    payme: "smartphone",
    visa: "credit-card",
    mastercard: "credit-card",
    amex: "credit-card",
  };

  return icons[type.toLowerCase() as keyof typeof icons] || "credit-card";
};

/**
 * Format card display
 */
export const formatCardDisplay = (
  brand: string,
  last4: string,
  expMonth: number,
  expYear: number
): string => {
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  return `${brandName} ••••${last4} ${expMonth
    .toString()
    .padStart(2, "0")}/${expYear}`;
};
