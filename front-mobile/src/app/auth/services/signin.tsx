import axios from "axios";
import API_URL from "@shared/constants/api";
import * as SecureStore from "expo-secure-store";

// Signin API Call
export const signin = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/sign-in`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = response.data;

    // Store the authentication token securely
    if (responseData.token) {
      await SecureStore.setItemAsync("authToken", responseData.token);
    }

    return responseData; // Return the response data to handle in your component
  } catch (error: any) {
    // Handle error response gracefully
    throw error.response?.data || { message: "Signin failed" };
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

// Function to remove the token (Logout)
export const removeAuthToken = async () => {
  try {
    await SecureStore.deleteItemAsync("authToken");
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};
