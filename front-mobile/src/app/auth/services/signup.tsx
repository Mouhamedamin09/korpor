import axios from "axios";
import API_URL from "@shared/constants/api";

interface SignupData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  birthdate: string;
  password: string;
  // phone: string; // omitted or never used
}

export const signupUser = async (data: SignupData) => {
  const response = await axios.post(`${API_URL}/api/auth/sign-up`, data, {
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
