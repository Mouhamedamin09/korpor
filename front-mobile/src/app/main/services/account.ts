// services/account.ts
import { authStore } from "@auth/services/authStore";
import API_URL from "../../../shared/constants/api";
import { apiService } from "../../services/apiService";

export interface VerificationProgress {
  completed: number;
  total: number;
}

export interface AccountData {
  id: number;
  accountNo: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  birthdate: string;
  profilePicture: string | null;
  lastLogin: string;
  isVerified: boolean;
  verificationProgress: {
    completed: number;
    total: number;
  };
  approvalStatus: "pending" | "approved" | "rejected";
}

export interface CloseAccountResponse {
  success: boolean;
  message: string;
  warnings?: string[];
}

// Get authentication token from SecureStore
const getAuthToken = async (): Promise<string | null> => {
  try {
    await authStore.getState().loadTokens();
    return authStore.getState().accessToken;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/** API call using SecureStore authentication */
export const fetchAccountData = async (): Promise<AccountData> => {
  try {
    console.log("[Account] Fetching profile data...");

    // Use apiService with SecureStore token
    const data = await apiService.get<AccountData>("/api/user/profile");

    console.log("[Account] ✅ Profile data received");

    // Add verification progress if not provided by the API
    if (!data.verificationProgress) {
      data.verificationProgress = {
        completed: data.isVerified ? 4 : 2,
        total: 4,
      };
    }

    // Ensure approvalStatus is set
    if (!data.approvalStatus) {
      data.approvalStatus = "pending";
    }

    return data;
  } catch (error) {
    console.error("[Account] ❌ Error fetching profile:", error);

    // Fallback to direct API call if apiService fails
    try {
      console.log("[Account] Trying fallback API call...");

      const token = await getAuthToken();
      console.log(
        "Token from authStore:",
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

      // Ensure approvalStatus is set
      if (!data.approvalStatus) {
        data.approvalStatus = "pending";
      }

      return data;
    } catch (fallbackError) {
      console.error(
        "[Account] ❌ Fallback API call also failed:",
        fallbackError
      );
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch account data"
      );
    }
  }
};

/** Update account data using apiService */
export const updateAccountData = async (
  updates: Partial<AccountData>
): Promise<AccountData> => {
  try {
    console.log("[Account] Updating account data...");

    const data = await apiService.put<AccountData>(
      "/api/user/profile",
      updates
    );

    console.log("[Account] ✅ Account data updated successfully");
    return data;
  } catch (error) {
    console.error("[Account] ❌ Error updating account:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update account data"
    );
  }
};

/** Upload profile picture using apiService */
export const uploadProfilePicture = async (
  imageFile: FormData
): Promise<{ profilePicture: string }> => {
  try {
    console.log("[Account] Uploading profile picture...");

    const data = await apiService.upload<{ profilePicture: string }>(
      "/api/user/profile/picture",
      imageFile
    );

    console.log("[Account] ✅ Profile picture uploaded successfully");
    return data;
  } catch (error) {
    console.error("[Account] ❌ Error uploading profile picture:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to upload profile picture"
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

/**
 * Close user account permanently
 */
export async function closeAccount(
  password: string
): Promise<CloseAccountResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("🔄 Attempting to close account...");

    const response = await fetch(`${API_URL}/api/auth/close-account`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // If there are warnings, return them
      if (response.status === 400 && data.warnings) {
        return {
          success: false,
          message: data.message || "Account cannot be closed",
          warnings: data.warnings,
        };
      }

      throw new Error(data.message || "Failed to close account");
    }

    console.log("✅ Account closed successfully");

    // Clear all stored authentication data
    await authStore.getState().clearTokens();

    return {
      success: true,
      message: data.message || "Account closed successfully",
    };
  } catch (error) {
    console.error("❌ Error closing account:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to close account"
    );
  }
}

export const logout = async (): Promise<{ success: boolean }> => {
  try {
    console.log("🔐 Starting logout process...");

    // Clear all authentication data using authStore
    await authStore.getState().clearTokens();

    console.log("✅ Logout completed successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Logout error:", error);
    return { success: false };
  }
};
