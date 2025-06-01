// @main/services/TwoFactor.ts

import { useAuthStore } from "@auth/services/authStore";
import API_URL from "../../../shared/constants/api";

export interface AuthSetupResponse {
  secret: string; // Base32 TOTP secret
  otpauthUrl: string; // otpauth:// URL for QR
  qrCode?: string; // Base64 encoded QR code image
  manualEntryKey?: string; // Manual entry key
}

export interface TwoFactorStatus {
  enabled: boolean;
  setupAt?: string;
  backupCodesRemaining: number;
}

// Get authentication token
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("accessToken");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Fetches a new TOTP secret + QR URL from the backend.
 */
export async function fetchAuthSetup(): Promise<AuthSetupResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("🔄 Fetching 2FA setup from backend...");

    const response = await fetch(`${API_URL}/api/2fa/setup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📦 2FA setup response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to setup 2FA");
    }

    const data = await response.json();
    console.log("✅ 2FA setup data received");

    return {
      secret: data.data.secret,
      otpauthUrl: data.data.otpauthUrl,
      qrCode: data.data.qrCode,
      manualEntryKey: data.data.manualEntryKey,
    };
  } catch (error) {
    console.error("❌ Error fetching 2FA setup:", error);
    throw error;
  }
}

/**
 * Verifies the 6-digit code against the TOTP secret and enables 2FA.
 */
export async function verifyAuthCode(
  secret: string,
  code: string
): Promise<boolean> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("🔄 Verifying 2FA code...");

    const response = await fetch(`${API_URL}/api/2fa/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: code,
      }),
    });

    console.log("📦 2FA verify response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ 2FA verification failed:", errorData.message);
      return false;
    }

    const data = await response.json();
    console.log("✅ 2FA enabled successfully");

    // Store backup codes if provided
    if (data.data && data.data.backupCodes) {
      await AsyncStorage.setItem(
        "2fa_backup_codes",
        JSON.stringify(data.data.backupCodes)
      );
    }

    return true;
  } catch (error) {
    console.error("❌ Error verifying 2FA code:", error);
    return false;
  }
}

/**
 * Get 2FA status for the current user
 */
export async function get2FAStatus(): Promise<TwoFactorStatus> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("🔄 Fetching 2FA status...");

    const response = await fetch(`${API_URL}/api/2fa/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to get 2FA status");
    }

    const data = await response.json();
    console.log("✅ 2FA status received:", data.data);

    return {
      enabled: data.data.enabled,
      setupAt: data.data.setupAt,
      backupCodesRemaining: data.data.backupCodesRemaining,
    };
  } catch (error) {
    console.error("❌ Error getting 2FA status:", error);
    throw error;
  }
}

/**
 * Disable 2FA for the current user
 */
export async function disable2FA(
  password: string,
  token?: string
): Promise<boolean> {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      throw new Error("No authentication token found");
    }

    console.log("🔄 Disabling 2FA...");

    const response = await fetch(`${API_URL}/api/2fa/disable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        token,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to disable 2FA");
    }

    console.log("✅ 2FA disabled successfully");

    // Remove stored backup codes
    await AsyncStorage.removeItem("2fa_backup_codes");

    return true;
  } catch (error) {
    console.error("❌ Error disabling 2FA:", error);
    throw error;
  }
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(
  password: string
): Promise<string[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("🔄 Regenerating backup codes...");

    const response = await fetch(`${API_URL}/api/2fa/regenerate-backup-codes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to regenerate backup codes");
    }

    const data = await response.json();
    console.log("✅ Backup codes regenerated");

    // Store new backup codes
    await AsyncStorage.setItem(
      "2fa_backup_codes",
      JSON.stringify(data.data.backupCodes)
    );

    return data.data.backupCodes;
  } catch (error) {
    console.error("❌ Error regenerating backup codes:", error);
    throw error;
  }
}
