import * as SecureStore from "expo-secure-store";
import { authStore } from "./authStore";
import { router } from "expo-router";
import API_URL from "../../../shared/constants/api";

// Types
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface TokenInfo {
  exp: number;
  userId: number;
  email: string;
  role?: string;
}

export interface User {
  id: number;
  accountNo: string;
  name: string;
  surname: string;
  email: string;
  profilePicture?: string;
  lastLogin?: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: User;
  role: string;
}

// Constants
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

class AuthService {
  private readonly ACCESS_TOKEN_KEY = "accessToken";
  private readonly REFRESH_TOKEN_KEY = "refreshToken";
  private readonly USER_KEY = "user";
  private readonly ROLE_KEY = "role";

  private refreshPromise: Promise<string> | null = null;
  private isRefreshing = false;

  /**
   * Decode JWT token to extract payload information
   */
  private decodeToken(token: string): TokenInfo | null {
    //decoding token (header.payload.signature) Each part is Base64-encoded.
    //Base64 encoding is a way to represent binary data as text.
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.warn("[AuthService] Invalid token format");
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return {
        exp: payload.exp,
        userId: payload.userId || payload.id,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      console.error("[AuthService] Error decoding token:", error);
      return null;
    }
  }

  /**
   * Check if token is expired or about to expire
   */
  private isTokenExpiringSoon(token: string): boolean {
    const tokenInfo = this.decodeToken(token);
    if (!tokenInfo) return true;

    const currentTime = Date.now();
    const expirationTime = tokenInfo.exp * 1000; // Convert to milliseconds
    const timeUntilExpiry = expirationTime - currentTime;

    console.log(
      `[AuthService] Token expires in: ${Math.floor(
        timeUntilExpiry / 1000
      )} seconds`
    );

    return timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Check if token is completely expired
   */
  private isTokenExpired(token: string): boolean {
    const tokenInfo = this.decodeToken(token);
    if (!tokenInfo) return true;

    const currentTime = Date.now();
    const expirationTime = tokenInfo.exp * 1000;

    return currentTime >= expirationTime;
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = await SecureStore.getItemAsync(
        this.REFRESH_TOKEN_KEY
      );

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      console.log("[AuthService] Refreshing access token...");

      const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("REFRESH_TOKEN_EXPIRED");
        }
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data: RefreshTokenResponse = await response.json();

      // Store new tokens
      await this.updateTokens(data.accessToken, data.refreshToken);

      console.log("[AuthService] ✅ Access token refreshed successfully");
      return data.accessToken;
    } catch (error) {
      console.error("[AuthService] ❌ Token refresh failed:", error);
      throw error;
    }
  }

  /**
   * Handle authentication failure - clear tokens and redirect to login
   */
  private async handleAuthFailure(
    reason: string = "Session expired"
  ): Promise<void> {
    console.log(`[AuthService] Handling auth failure: ${reason}`);

    // Clear all authentication data
    await this.clearAllData();

    // Reset refresh state
    this.isRefreshing = false;
    this.refreshPromise = null;

    // Redirect to login screen
    try {
      router.replace("/auth/screens/Login");
    } catch (error) {
      console.error("[AuthService] Error redirecting to login:", error);
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  public async getValidAccessToken(): Promise<string | null> {
    try {
      // Load tokens from SecureStore into authStore state
      await authStore.getState().loadTokens();
      return authStore.getState().accessToken;
    } catch (error) {
      console.error("Error getting access token:", error);
      await this.handleAuthFailure("Authentication error");
      return null;
    }
  }

  /**
   * Get refresh token from SecureStore
   */
  public async getRefreshToken(): Promise<string | null> {
    try {
      await authStore.getState().loadTokens();
      return authStore.getState().refreshToken;
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  /**
   * Get authentication headers with automatic token refresh
   */
  public async getAuthHeaders(): Promise<{ [key: string]: string } | null> {
    const accessToken = await this.getValidAccessToken();

    if (!accessToken) {
      return null;
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
  }

  /**
   * Make an authenticated API request with automatic token refresh
   */
  public async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = await this.getAuthHeaders();

    if (!headers) {
      throw new Error("Authentication required");
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);

      // Handle authentication errors
      if (response.status === 401) {
        console.log("[AuthService] Received 401, attempting token refresh");

        // Try to refresh token and retry the request
        try {
          const newToken = await this.refreshAccessToken();
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };

          const retryOptions: RequestInit = {
            ...options,
            headers: {
              ...newHeaders,
              ...options.headers,
            },
          };

          const retryResponse = await fetch(url, retryOptions);

          if (retryResponse.status === 401) {
            await this.handleAuthFailure("Authentication failed after refresh");
            throw new Error("Authentication failed");
          }

          return retryResponse;
        } catch (refreshError) {
          await this.handleAuthFailure("Token refresh failed");
          throw new Error("Authentication failed");
        }
      }

      return response;
    } catch (error) {
      console.error("[AuthService] Authenticated fetch error:", error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getValidAccessToken();
      return !!token;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

  /**
   * Logout user and clear all authentication data
   */
  public async logout(): Promise<void> {
    try {
      console.log("🔄 AUTHSERVICE: Starting logout...");

      // Clear tokens using authStore (which clears SecureStore)
      await authStore.getState().clearTokens();

      // Clear user and role data from SecureStore
      await SecureStore.deleteItemAsync(this.USER_KEY);
      await SecureStore.deleteItemAsync(this.ROLE_KEY);

      console.log("✅ AUTHSERVICE: Logout completed successfully");
    } catch (error) {
      console.error("❌ AUTHSERVICE: Error during logout:", error);
      // Don't throw error for logout to prevent blocking user
    }
  }

  /**
   * Store authentication data after successful login
   */
  public async storeAuthData(authData: AuthData): Promise<void> {
    try {
      console.log("🔄 AUTHSERVICE: Storing auth data in SecureStore...");

      // Use authStore for token storage (which uses SecureStore)
      await authStore
        .getState()
        .setTokens(authData.accessToken, authData.refreshToken);

      // Store user and role data in SecureStore directly
      await SecureStore.setItemAsync(
        this.USER_KEY,
        JSON.stringify(authData.user)
      );
      await SecureStore.setItemAsync(this.ROLE_KEY, authData.role);

      console.log(
        "✅ AUTHSERVICE: Auth data stored successfully in SecureStore"
      );
    } catch (error) {
      console.error("❌ AUTHSERVICE: Error storing auth data:", error);
      throw new Error("Failed to store authentication data");
    }
  }

  /**
   * Get current user data from storage
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      const userString = await SecureStore.getItemAsync(this.USER_KEY);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get current user role from storage
   */
  public async getCurrentUserRole(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.ROLE_KEY);
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }

  /**
   * Update stored tokens
   */
  public async updateTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    try {
      await authStore.getState().setTokens(accessToken, refreshToken);
      console.log("✅ AUTHSERVICE: Tokens updated successfully");
    } catch (error) {
      console.error("❌ AUTHSERVICE: Error updating tokens:", error);
      throw new Error("Failed to update tokens");
    }
  }

  /**
   * Clear all stored data (for account deletion, etc.)
   */
  public async clearAllData(): Promise<void> {
    try {
      console.log("🔄 AUTHSERVICE: Clearing all auth data...");

      await this.logout(); // This will clear tokens, user, and role

      // Clear any additional SecureStore items if needed
      // Add any other keys that might be stored

      console.log("✅ AUTHSERVICE: All auth data cleared");
    } catch (error) {
      console.error("❌ AUTHSERVICE: Error clearing all data:", error);
    }
  }

  /**
   * Update user data in SecureStore
   */
  public async updateUser(user: User): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
      console.log("✅ AUTHSERVICE: User data updated");
    } catch (error) {
      console.error("❌ AUTHSERVICE: Error updating user:", error);
      throw new Error("Failed to update user data");
    }
  }

  /**
   * Update user role in SecureStore
   */
  public async updateRole(role: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.ROLE_KEY, role);
      console.log("✅ AUTHSERVICE: User role updated");
    } catch (error) {
      console.error("❌ AUTHSERVICE: Error updating role:", error);
      throw new Error("Failed to update user role");
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
