import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../../shared/constants/api";

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

export const signin = async (
  credentials: SignInCredentials
): Promise<SignInResponse> => {
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

    // Store tokens and user data in AsyncStorage
    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);
    await AsyncStorage.setItem("userData", JSON.stringify(data.user));

    return data;
  } catch (error: any) {
    console.error("Sign in error:", error);
    if (error.message === "Network request failed") {
      throw new Error(
        "Unable to connect to the server. Please check your internet connection."
      );
    }
    throw error;
  }
};
