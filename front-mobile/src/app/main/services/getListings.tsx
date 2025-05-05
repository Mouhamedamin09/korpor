import axios from "axios";
import API_URL from "@shared/constants/api";

// Fetch properties to be shown in the mobile app
export const getAllProperties = async () => {
  try {
    const response = await axios.get(`${API_URL}/properties`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data; // Expected: array of property objects
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch property list" };
  }
};
