// @main/services/Preferences.ts

import { authStore } from "@auth/services/authStore";
import API_URL from "../../../shared/constants/api";

export type Market = "Tunisia" | "France";
export type Preference = "all" | "local";

export interface UserPreferences {
  region: Market;
  preference: Preference;
}

// Get authentication token
const getAuthToken = async (): Promise<string | null> => {
  try {
    // Try to get real token from SecureStore first
    const token = authStore.getState().accessToken;
    if (token) {
      return token;
    }

    // For development, use mock token for user ID 1
    return "mock-token-user-1";
  } catch (error) {
    console.error("Error getting auth token:", error);
    // Fallback to mock token for development
    return "mock-token-user-1";
  }
};

/**
 * Fetch current user preferences from backend
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    console.log(
      "📱 Fetching user preferences from:",
      `${API_URL}/api/preferences`
    );

    const response = await fetch(`${API_URL}/api/preferences`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📱 Preferences response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("📱 Preferences data received:", result);

    return {
      region: result.data.region as Market,
      preference: result.data.preference as Preference,
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);

    // Return default preferences on error
    return {
      region: "Tunisia",
      preference: "all",
    };
  }
}

/**
 * Update the preference on the server
 */
export async function setUserPreference(
  preference: Preference
): Promise<UserPreferences> {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    console.log("📱 Updating user preference to:", preference);

    const response = await fetch(`${API_URL}/api/preferences/preference`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preference }),
    });

    console.log("📱 Update preference response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("📱 Update preference result:", result);

    return {
      region: result.data.region as Market,
      preference: result.data.preference as Preference,
    };
  } catch (error) {
    console.error("Error updating user preference:", error);
    throw error;
  }
}

/**
 * Update the region on the server
 */
export async function setUserRegion(region: Market): Promise<UserPreferences> {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    console.log("📱 Updating user region to:", region);

    const response = await fetch(`${API_URL}/api/preferences/region`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ region }),
    });

    console.log("📱 Update region response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        await authStore.getState().clearTokens();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("📱 Update region result:", result);

    return {
      region: result.data.region as Market,
      preference: result.data.preference as Preference,
    };
  } catch (error) {
    console.error("Error updating user region:", error);
    throw error;
  }
}
