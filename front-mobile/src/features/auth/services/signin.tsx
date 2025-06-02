import axios from "axios";
import API_URL from "../../../shared/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    // Store the authentication token (backend returns 'accessToken', not 'token')
    if (responseData.accessToken) {
      await AsyncStorage.setItem("accessToken", responseData.accessToken);
      console.log("[SignIn] Token stored successfully as 'accessToken'");
    } else {
      console.warn(
        "[SignIn] No accessToken found in response:",
        Object.keys(responseData)
      );
    }

    return responseData; // Return the response data to handle in your component
  } catch (error: any) {
    // Handle error response gracefully
    throw error.response?.data || { message: "Signin failed" };
  }
};

// Function to retrieve the token (if needed)
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem("accessToken"); // Retrieve the token
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

// Function to remove the token (Logout)
export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem("accessToken"); // Remove the token
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};
