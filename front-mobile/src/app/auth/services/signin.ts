import API_URL from "@/shared/constants/api";
import axios from "axios";
import { authStore } from "./authStore";

interface SignInCredentials {
  email: string;
  password: string;
}

export const signin = async (credentials: SignInCredentials) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/sign-in`,
      credentials,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    const { accessToken, refreshToken, user } = response.data;

    // Save to store (and SecureStore under the hood)
    const store = authStore.getState();
    await store.setTokens(accessToken, refreshToken);

    return response.data;
  } catch (error: any) {
    console.error("❌ Signin error:", error);
    throw new Error("Failed to sign in. Please try again.");
  }
};
