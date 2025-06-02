// services/account.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../../shared/constants/api";
import { apiService } from "../../services/apiService";
import { authService } from "../../auth/services/authService";

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

/** API call using the new ApiService with automatic token refresh */
export const fetchAccountData = async (): Promise<AccountData> => {
  try {
    console.log("[Account] Fetching profile data...");

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
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch account data"
    );
  }
};

/** Update account data using the new ApiService */
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

/** Upload profile picture using the new ApiService */
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

/** Get current user from AuthService */
export const getCurrentUser = async (): Promise<any | null> => {
  return await authService.getCurrentUser();
};

/** Get current user role from AuthService */
export const getCurrentUserRole = async (): Promise<string | null> => {
  return await authService.getCurrentUserRole();
};

/** Check if user is authenticated using AuthService */
export const isUserAuthenticated = async (): Promise<boolean> => {
  return await authService.isAuthenticated();
};

// Legacy function for backward compatibility
const getAuthToken = async (): Promise<string | null> => {
  return await authService.getValidAccessToken();
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
    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "userData",
      "userRole",
      "2fa_backup_codes",
    ]);

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
