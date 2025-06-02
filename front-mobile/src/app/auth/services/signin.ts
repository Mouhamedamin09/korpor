import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../../shared/constants/api";
import { authService } from "./authService";

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignInResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    accountNo: string;
    name: string;
    surname: string;
    email: string;
    profilePicture: string;
    lastLogin: string;
  };
  role: string;
  privileges: string[];
  deviceInfo: {
    deviceId: string;
    browser: string;
    os: string;
    location: string;
  };
  dashboardRoute: string;
}

interface TwoFactorRequiredResponse {
  message: string;
  requires2FA: boolean;
  userId: number;
  email: string;
  tempSession: boolean;
}

// Custom error class for 2FA required
export class TwoFactorRequiredError extends Error {
  public requires2FA: boolean = true;
  public userId: number;
  public email: string;

  constructor(message: string, userId: number, email: string) {
    super(message);
    this.name = "TwoFactorRequiredError";
    this.userId = userId;
    this.email = email;
  }
}

export const signin = async (
  credentials: SignInCredentials
): Promise<SignInResponse> => {
  console.log("🔄 SIGNIN SERVICE: Starting signin process");

  try {
    console.log("Attempting to sign in with:", { email: credentials.email });
    console.log("API URL:", `${API_URL}/api/auth/sign-in`);

    const response = await fetch(`${API_URL}/api/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log("Sign in response:", { status: response.status, data });

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error("Invalid email or password");
      } else if (response.status === 403) {
        throw new Error(
          data.message || "Account not verified or pending approval"
        );
      } else if (response.status === 423) {
        throw new Error("Account temporarily locked. Please try again later.");
      }
      throw new Error(data.message || "Sign in failed");
    }

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

    // Store authentication data using the new AuthService
    await authService.storeAuthData({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      role: data.role,
    });

    console.log("✅ SIGNIN SERVICE: Authentication data stored successfully");

    return data;
  } catch (error: any) {
    console.error("🔥 SIGNIN SERVICE: Error in signin service:", error);
    console.log("🔍 SIGNIN SERVICE: Error type check:", {
      name: error.name,
      requires2FA: error.requires2FA,
      isInstance: error instanceof TwoFactorRequiredError,
      typeof: typeof error,
    });

    // Re-throw TwoFactorRequiredError as-is with additional property checks
    if (
      error instanceof TwoFactorRequiredError ||
      error?.requires2FA ||
      error?.name === "TwoFactorRequiredError"
    ) {
      console.log("🔄 Re-throwing 2FA error:", {
        name: error.name,
        requires2FA: error.requires2FA,
        userId: error.userId,
        email: error.email,
      });
      console.log("🚀 SIGNIN SERVICE: Re-throwing 2FA error to LoginCard");
      throw error;
    }

    if (error.message === "Network request failed") {
      console.log("🌐 SIGNIN SERVICE: Network error detected");
      throw new Error(
        "Unable to connect to the server. Please check your internet connection."
      );
    }

    console.log("⚠️ SIGNIN SERVICE: Throwing generic error");
    throw error;
  }
};

// Function to retrieve the token (compatibility function)
export const getAuthToken = async () => {
  try {
    return await authService.getValidAccessToken();
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

// Function to remove the token (Logout)
export const removeAuthToken = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};
