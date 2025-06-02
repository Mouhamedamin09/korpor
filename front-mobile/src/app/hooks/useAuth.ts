import { useState, useEffect, useCallback } from "react";
import { authService } from "../auth/services/authService";

interface User {
  id: number;
  accountNo: string;
  name: string;
  surname: string;
  email: string;
  profilePicture: string;
  lastLogin: string;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userRole: string | null;
  login: (authData: {
    accessToken: string;
    refreshToken: string;
    user: User;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  getValidToken: () => Promise<string | null>;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[useAuth] Checking authentication status...");

      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Load user data
        const userData = await authService.getCurrentUser();
        const roleData = await authService.getCurrentUserRole();

        setUser(userData);
        setUserRole(roleData);

        console.log("[useAuth] ✅ User authenticated:", userData?.email);
      } else {
        setUser(null);
        setUserRole(null);
        console.log("[useAuth] ❌ User not authenticated");
      }
    } catch (error) {
      console.error("[useAuth] Error checking auth status:", error);
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(
    async (authData: {
      accessToken: string;
      refreshToken: string;
      user: User;
      role?: string;
    }) => {
      try {
        console.log("[useAuth] Logging in user:", authData.user.email);

        await authService.storeAuthData(authData);

        setIsAuthenticated(true);
        setUser(authData.user);
        setUserRole(authData.role || null);

        console.log("[useAuth] ✅ Login successful");
      } catch (error) {
        console.error("[useAuth] Login error:", error);
        throw error;
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      console.log("[useAuth] Logging out user...");

      await authService.logout();

      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);

      console.log("[useAuth] ✅ Logout successful");
    } catch (error) {
      console.error("[useAuth] Logout error:", error);
      // Even if logout fails, clear local state
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
      throw error;
    }
  }, []);

  // Refresh authentication (useful after profile updates)
  const refreshAuth = useCallback(async () => {
    await checkAuthStatus();
  }, [checkAuthStatus]);

  // Get valid token
  const getValidToken = useCallback(async () => {
    try {
      return await authService.getValidAccessToken();
    } catch (error) {
      console.error("[useAuth] Error getting valid token:", error);
      return null;
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    isLoading,
    user,
    userRole,
    login,
    logout,
    refreshAuth,
    getValidToken,
  };
};
