// services/account.ts
import { authStore } from "@auth/services/authStore";
import API_URL from "../../../shared/constants/api";

export interface VerificationProgress {
  completed: number;
  total: number;
}

export interface AccountData {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: string;
  korporSince: string;
  intro: string;
  investmentUsedPct: number;
  investmentTotal: number;
  globalUsers: number;
  globalCountries: number;
  verificationProgress: VerificationProgress;
  profilePicture?: string;
  isVerified: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
}

/** Real API call to GET /api/user/profile */
export const fetchAccountData = async (): Promise<AccountData> => {
  try {
    // Get the JWT token from SecureStore
    const token = authStore.getState().accessToken;
    console.log(
      "Token from SecureStore:",
      token ? "Token exists" : "No token found"
    );

    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Fetching profile from:", `${API_URL}/api/user/profile`);
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Profile response status:", response.status);
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Profile data received:", data);

    // Add verification progress if not provided by the API
    if (!data.verificationProgress) {
      data.verificationProgress = {
        completed: data.isVerified ? 4 : 2,
        total: 4,
      };
    }

    // Ensure all required fields are present
    const accountData: AccountData = {
      id: data.id || "",
      name: data.name || "User",
      email: data.email || "",
      phone: data.phone || "",
      accountType: data.accountType || "Individual Account",
      korporSince: data.korporSince || new Date().toISOString(),
      intro: data.intro || "",
      investmentUsedPct: data.investmentUsedPct || 0,
      investmentTotal: data.investmentTotal || 0,
      globalUsers: data.globalUsers || 0,
      globalCountries: data.globalCountries || 0,
      verificationProgress: data.verificationProgress,
      profilePicture: data.profilePicture,
      isVerified: data.isVerified || false,
      approvalStatus: data.approvalStatus || "pending",
    };

    return accountData;
  } catch (error) {
    console.error("Error fetching account data:", error);
    // Rethrow with a user-friendly message
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch account data"
    );
  }
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
