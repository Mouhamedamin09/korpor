import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "@shared/constants/api";

// Fake user credentials for testing
const FAKE_USERS = [
  {
    email: "amin.kraiem@korpor.com",
    password: "password123",
    name: "Amin Kraiem",
  },
  {
    email: "john.smith@korpor.com",
    password: "password123",
    name: "John Smith",
  },
  {
    email: "sarah.johnson@korpor.com",
    password: "password123",
    name: "Sarah Johnson",
  },
];

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const fakeLogin = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find user in fake users array
    const user = FAKE_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Generate a fake JWT token
    const fakeToken = `fake-jwt-token-${Math.random()
      .toString(36)
      .substring(7)}`;

    // Store token in AsyncStorage
    await AsyncStorage.setItem("token", fakeToken);

    // Return fake response
    return {
      token: fakeToken,
      user: {
        id: Math.floor(Math.random() * 1000),
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(error instanceof Error ? error.message : "Login failed");
  }
};

export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("token");
    return !!token;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
};
