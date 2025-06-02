// @main/services/Verification.ts
import API_URL from "../../../shared/constants/api";
import { authStore } from "@auth/services/authStore";

export interface VerificationResult {
  qualified: boolean;
  message?: string;
}
export interface VerificationStatus {
  identity: VerificationResult;
  address: VerificationResult;
}

export interface BackendVerificationStatus {
  userId: number;
  identityStatus: "pending" | "under_review" | "approved" | "rejected";
  addressStatus: "pending" | "under_review" | "approved" | "rejected";
  overallStatus: "incomplete" | "under_review" | "verified" | "rejected";
  canProceed: boolean;
  nextStep: "identity" | "address" | "waiting_review" | "completed";
  identitySubmittedAt?: string;
  addressSubmittedAt?: string;
  identityRejectionReason?: string;
  addressRejectionReason?: string;
}

// Get user token from storage
const getAuthToken = async (): Promise<string | null> => {
  try {
    // Use the same pattern as AutoInvest service
    const token =
      (await authStore.getState().accessToken) || "mock-token-user-1";
    console.log(
      "Verification service using token:",
      token ? `${token.substring(0, 20)}...` : "none"
    );
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return "mock-token-user-1"; // Fallback to mock token
  }
};

// Get current user ID
const getCurrentUserId = (): number => {
  // For now, hardcode user ID 1 for testing
  // In production, you would get this from your auth context/store
  return 1;
};

/**
 * Called from VerificationProgressScreen when user taps "Next"
 * with their passport + selfie URIs.
 */
export async function submitIdentityVerification(
  passportUri: string,
  selfieUri: string
): Promise<VerificationResult> {
  try {
    const token = await getAuthToken();
    const userId = getCurrentUserId();

    if (!token) {
      throw new Error("Authentication required");
    }

    // Create FormData for file upload
    const formData = new FormData();

    // Convert URI to file (for React Native)
    const passportFile = {
      uri: passportUri,
      type: "image/jpeg",
      name: "passport.jpg",
    } as any;

    const selfieFile = {
      uri: selfieUri,
      type: "image/jpeg",
      name: "selfie.jpg",
    } as any;

    formData.append("passportImage", passportFile);
    formData.append("selfieImage", selfieFile);
    formData.append("userId", userId.toString());

    const response = await fetch(`${API_URL}/api/verification/identity`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData - let the browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();

    return {
      qualified: true,
      message: data.message || "Identity documents uploaded successfully",
    };
  } catch (error) {
    console.error("Identity verification error:", error);
    return {
      qualified: false,
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Called from AddressProgressScreen when user taps "Next"
 */
export async function submitAddressVerification(
  addressUri: string
): Promise<VerificationResult> {
  try {
    const token = await getAuthToken();
    const userId = getCurrentUserId();

    if (!token) {
      throw new Error("Authentication required");
    }

    // Create FormData for file upload
    const formData = new FormData();

    // Convert URI to file (for React Native)
    const addressFile = {
      uri: addressUri,
      type: "image/jpeg",
      name: "address.jpg",
    } as any;

    formData.append("addressImage", addressFile);
    formData.append("userId", userId.toString());

    const response = await fetch(`${API_URL}/api/verification/address`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();

    return {
      qualified: true,
      message: data.message || "Address document uploaded successfully",
    };
  } catch (error) {
    console.error("Address verification error:", error);
    return {
      qualified: false,
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Polled by CompleteAccountSetupScreen & ProfileScreen
 */
export async function fetchVerificationStatus(): Promise<VerificationStatus> {
  try {
    const token = await getAuthToken();
    const userId = getCurrentUserId();

    if (!token) {
      // Return default status for unauthenticated users
      return {
        identity: { qualified: false },
        address: { qualified: false },
      };
    }

    const response = await fetch(
      `${API_URL}/api/verification/status/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch verification status");
    }

    const data: BackendVerificationStatus = await response.json();

    // Convert backend status to frontend format
    const identityResult: VerificationResult = {
      qualified: data.identityStatus === "approved",
      message:
        data.identityStatus === "rejected"
          ? data.identityRejectionReason
          : undefined,
    };

    const addressResult: VerificationResult = {
      qualified: data.addressStatus === "approved",
      message:
        data.addressStatus === "rejected"
          ? data.addressRejectionReason
          : undefined,
    };

    return {
      identity: identityResult,
      address: addressResult,
    };
  } catch (error) {
    console.error("Error fetching verification status:", error);
    // Return default status on error
    return {
      identity: { qualified: false },
      address: { qualified: false },
    };
  }
}

/**
 * Get detailed verification status from backend
 */
export async function fetchDetailedVerificationStatus(): Promise<BackendVerificationStatus | null> {
  try {
    const token = await getAuthToken();
    const userId = getCurrentUserId();

    if (!token) {
      // Return default status for new users (2/4 progress)
      return {
        userId,
        identityStatus: "pending",
        addressStatus: "pending",
        overallStatus: "incomplete",
        canProceed: true,
        nextStep: "identity",
      };
    }

    const response = await fetch(
      `${API_URL}/api/verification/status/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(
        "Failed to fetch detailed verification status, using defaults"
      );
      // Return default status if API fails (new user scenario)
      return {
        userId,
        identityStatus: "pending",
        addressStatus: "pending",
        overallStatus: "incomplete",
        canProceed: true,
        nextStep: "identity",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching detailed verification status:", error);
    // Return default status for new users
    const userId = getCurrentUserId();
    return {
      userId,
      identityStatus: "pending",
      addressStatus: "pending",
      overallStatus: "incomplete",
      canProceed: true,
      nextStep: "identity",
    };
  }
}
