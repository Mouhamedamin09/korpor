import AsyncStorage from "@react-native-async-storage/async-storage";
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

// Constants
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_DATA: "userData",
  USER_ROLE: "userRole",
} as const;

class AuthService {
  private refreshPromise: Promise<string> | null = null;
  private isRefreshing = false;

  /**
   * Decode JWT token to extract payload information
   */
  private decodeToken(token: string): TokenInfo | null {
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
      const refreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
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
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken),
      ]);

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
    console.log(`[AuthService] 🚪 Handling auth failure: ${reason}`);

    // Clear all authentication data
    await this.clearAuthData();

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
   * Clear all authentication data from storage
   */
  private async clearAuthData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
      console.log("[AuthService] 🧹 Authentication data cleared");
    } catch (error) {
      console.error("[AuthService] Error clearing auth data:", error);
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  public async getValidAccessToken(): Promise<string | null> {
    try {
      let accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!accessToken) {
        console.log("[AuthService] No access token found");
        await this.handleAuthFailure("No access token");
        return null;
      }

      // Check if token is completely expired
      if (this.isTokenExpired(accessToken)) {
        console.log("[AuthService] Access token is expired");

        // If already refreshing, wait for the existing refresh
        if (this.isRefreshing && this.refreshPromise) {
          try {
            accessToken = await this.refreshPromise;
            return accessToken;
          } catch (error) {
            console.error("[AuthService] Concurrent refresh failed:", error);
            await this.handleAuthFailure("Token refresh failed");
            return null;
          }
        }

        // Start refresh process
        this.isRefreshing = true;
        this.refreshPromise = this.refreshAccessToken()
          .then((newToken) => {
            this.isRefreshing = false;
            this.refreshPromise = null;
            return newToken;
          })
          .catch(async (error) => {
            this.isRefreshing = false;
            this.refreshPromise = null;

            if (error.message === "REFRESH_TOKEN_EXPIRED") {
              await this.handleAuthFailure(
                "Session expired - please login again"
              );
            } else {
              await this.handleAuthFailure("Token refresh failed");
            }
            throw error;
          });

        try {
          accessToken = await this.refreshPromise;
        } catch (error) {
          return null;
        }
      }
      // Check if token is expiring soon
      else if (this.isTokenExpiringSoon(accessToken)) {
        console.log(
          "[AuthService] Access token expiring soon, refreshing proactively"
        );

        // Don't block the current request, refresh in background
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshAccessToken()
            .then(() => {
              this.isRefreshing = false;
              console.log("[AuthService] Background refresh completed");
            })
            .catch(async (error) => {
              this.isRefreshing = false;
              console.error("[AuthService] Background refresh failed:", error);

              if (error.message === "REFRESH_TOKEN_EXPIRED") {
                await this.handleAuthFailure(
                  "Session expired - please login again"
                );
              }
            });
        }
      }

      return accessToken;
    } catch (error) {
      console.error("[AuthService] Error getting valid access token:", error);
      await this.handleAuthFailure("Authentication error");
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
      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
      );

      if (!accessToken || !refreshToken) {
        return false;
      }

      // Check if access token is valid or can be refreshed
      const validToken = await this.getValidAccessToken();
      return !!validToken;
    } catch (error) {
      console.error("[AuthService] Error checking authentication:", error);
      return false;
    }
  }

  /**
   * Logout user and clear all authentication data
   */
  public async logout(): Promise<void> {
    try {
      console.log("[AuthService] Starting logout process...");

      // Get the access token for the logout request
      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      // Call backend logout endpoint if token exists
      if (accessToken) {
        try {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });
          console.log("[AuthService] ✅ Backend logout successful");
        } catch (error) {
          console.warn(
            "[AuthService] ⚠️ Backend logout failed, continuing with local cleanup"
          );
        }
      }

      // Clear all authentication data
      await this.clearAuthData();

      // Reset refresh state
      this.isRefreshing = false;
      this.refreshPromise = null;

      console.log("[AuthService] ✅ Logout completed");
    } catch (error) {
      console.error("[AuthService] Error during logout:", error);
      throw error;
    }
  }

  /**
   * Store authentication data after successful login
   */
  public async storeAuthData(authData: {
    accessToken: string;
    refreshToken: string;
    user: any;
    role?: string;
  }): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken),
        AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(authData.user)
        ),
        ...(authData.role
          ? [AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, authData.role)]
          : []),
      ]);

      console.log("[AuthService] ✅ Authentication data stored successfully");
    } catch (error) {
      console.error("[AuthService] Error storing auth data:", error);
      throw error;
    }
  }

  /**
   * Get current user data from storage
   */
  public async getCurrentUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("[AuthService] Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get current user role from storage
   */
  public async getCurrentUserRole(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
    } catch (error) {
      console.error("[AuthService] Error getting current user role:", error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
