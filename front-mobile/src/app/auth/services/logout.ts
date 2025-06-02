import { authService } from "./authService";

interface LogoutResponse {
  message: string;
}

export const logout = async (): Promise<LogoutResponse> => {
  try {
    console.log("Starting logout process...");

    // Use the new AuthService for logout
    await authService.logout();

    return {
      message: "Logout successful",
    };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error(error instanceof Error ? error.message : "Logout failed");
  }
};
