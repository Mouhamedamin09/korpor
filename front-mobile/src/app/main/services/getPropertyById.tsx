import axios from "axios";
import API_URL from "@shared/constants/api"; // should point to base URL like http://localhost:5000/api or your production URL
import { Property } from "@shared/types/property";

// Fetch a specific property by its ID
export const getPropertyById = async (id: string): Promise<Property> => {
  try {
    const response = await axios.get(`${API_URL}/property/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data || { message: "Failed to fetch property details" }
    );
  }
};
