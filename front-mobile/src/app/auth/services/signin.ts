import API_URL from "../../../shared/constants/api";
import axios from "axios";
import { authService } from "./authService";
import { authStore } from "./authStore";

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
  role?: string;
  requires2FA?: boolean;
  userId?: string;
  email?: string;
  message?: string;
}

class TwoFactorRequiredError extends Error {
  public requires2FA = true;
  public userId: string;
  public email: string;

  constructor(message: string, userId: string, email: string) {
    super(message);
    this.name = "TwoFactorRequiredError";
    this.userId = userId;
    this.email = email;
  }
}

export { TwoFactorRequiredError };

export const signin = async (
  credentials: SignInCredentials
): Promise<SignInResponse> => {
  console.log("🔄 SIGNIN SERVICE: Starting signin process");

  try {
    console.log("Attempting to sign in with:", { email: credentials.email });
    console.log("API URL:", `${API_URL}/api/auth/sign-in`);

    // Use axios for the request with better error handling
    const response = await axios.post(
      `${API_URL}/api/auth/sign-in`,
      credentials,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    const data = response.data;
    console.log("Sign in response:", { status: response.status, data });

    // Check if 2FA is required
    if (data.requires2FA) {
      console.log("🔐 2FA required for login");
      console.log("2FA Response data:", data);
      const error = new TwoFactorRequiredError(
        data.message,
        data.userId,
        data.email
      );
      console.log("Created 2FA error:", {
        name: error.name,
        requires2FA: error.requires2FA,
        userId: error.userId,
        email: error.email,
      });
      console.log("🚀 SIGNIN SERVICE: About to throw 2FA error");
      throw error;
    }

    // Store complete authentication data using authService for consistency
    await authService.storeAuthData({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      role: data.role || "user",
    });

    console.log(
      "✅ SIGNIN SERVICE: Complete authentication data stored in SecureStore successfully"
    );

    return data;
  } catch (error) {
    if (error instanceof TwoFactorRequiredError) {
      // Re-throw 2FA errors
      throw error;
    }

    console.error("❌ SIGNIN SERVICE: Error during signin:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw error.response.data || { message: "Signin failed" };
      } else if (error.request) {
        throw { message: "Network error - please check your connection" };
      }
    }

    throw { message: "Signin failed - please try again" };
  }
};

// Function to retrieve the token from SecureStore
export const getAuthToken = async (): Promise<string | null> => {
  try {
    // Use authService to get valid access token
    return await authService.getValidAccessToken();
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

// Function to clear tokens (logout)
export const clearAuthTokens = async (): Promise<void> => {
  try {
    await authService.logout();
    console.log("✅ Auth tokens cleared from SecureStore");
  } catch (error) {
    console.error("Error clearing auth tokens:", error);
  }
};
