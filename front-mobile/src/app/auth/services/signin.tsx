import axios from "axios";
import API_URL from "@shared/constants/api";
import * as SecureStore from "expo-secure-store";

// Signin API Call
export const signin = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    console.log("🔄 Attempting signin with API URL:", API_URL);
    console.log("📱 Request payload:", {
      email: credentials.email,
      password: "***",
    });

    const response = await axios.post(
      `${API_URL}/api/auth/sign-in`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log("✅ Signin response status:", response.status);
    console.log("📄 Response headers:", response.headers);

    const responseData = response.data;
    console.log("📦 Response data type:", typeof responseData);
    console.log("📦 Response data:", responseData);

    // Store the authentication tokens using AsyncStorage
    if (responseData.accessToken) {
      await AsyncStorage.setItem("accessToken", responseData.accessToken);
      console.log("💾 Stored accessToken");
    }

    if (responseData.refreshToken) {
      await AsyncStorage.setItem("refreshToken", responseData.refreshToken);
      console.log("💾 Stored refreshToken");
    }

    // Store the authentication token securely
    if (responseData.token) {
      await SecureStore.setItemAsync("authToken", responseData.token);
    }

    return responseData; // Return the response data to handle in your component
  } catch (error: any) {
    console.error("❌ Signin error details:", error);

    if (
      error.code === "NETWORK_ERROR" ||
      error.message?.includes("Network Error")
    ) {
      throw {
        message:
          "Network error. Please check if the backend server is running and accessible.",
      };
    }

    if (error.response) {
      // Server responded with error status
      console.error("🔴 Server response status:", error.response.status);
      console.error("🔴 Server response data:", error.response.data);
      console.error("🔴 Server response headers:", error.response.headers);
      throw error.response.data || { message: "Server error occurred" };
    } else if (error.request) {
      // Request was made but no response received
      console.error("🔴 No response received:", error.request);
      throw {
        message:
          "No response from server. Please check your network connection and ensure the backend is running.",
      };
    } else {
      // Something else happened
      console.error("🔴 Request setup error:", error.message);
      throw { message: `Request error: ${error.message}` };
    }
  }
};

// Function to retrieve the token
export const getAuthToken = async () => {
  try {
    return await SecureStore.getItemAsync("authToken");
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

// Function to remove the tokens (Logout)
export const removeAuthToken = async () => {
  try {
    await SecureStore.deleteItemAsync("authToken");
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};
