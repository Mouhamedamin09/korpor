import axios from "axios";
import API_URL from "@shared/constants/api";

interface SignupData {
  name: string;
  surname: string;
  email: string;
  birthdate: string;
  password: string;
  phone?: string; // optional for backward compatibility
}

export const signupUser = async (data: SignupData) => {
  // Include default phone if not provided
  const payload = {
    ...data,
    phone: data.phone || "", // Default to empty string if not provided
  };

  const response = await axios.post(`${API_URL}/api/auth/sign-up`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const verifySignUp = async (email: string, code: string) => {
  const response = await axios.post(`${API_URL}/api/auth/verify-email`, {
    email,
    code,
  });
  return response.data;
};
