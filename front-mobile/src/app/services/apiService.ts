import { authService } from "../auth/services/authService";
import API_URL from "../../shared/constants/api";

// Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  authenticated?: boolean;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an HTTP request with automatic authentication and error handling
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const { authenticated = true, headers = {}, ...requestOptions } = options;

    try {
      let finalHeaders = {
        "Content-Type": "application/json",
        ...headers,
      };

      // Add authentication headers if required
      if (authenticated) {
        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
          throw new Error("Authentication required");
        }
        finalHeaders = { ...finalHeaders, ...authHeaders };
      }

      const requestConfig: RequestInit = {
        ...requestOptions,
        headers: finalHeaders,
      };

      console.log(`[ApiService] ${requestOptions.method || "GET"} ${endpoint}`);

      let response: Response;

      if (authenticated) {
        // Use AuthService's authenticated fetch for automatic token refresh
        response = await authService.authenticatedFetch(url, requestConfig);
      } else {
        // Use regular fetch for non-authenticated requests
        response = await fetch(url, requestConfig);
      }

      // Handle different response types
      const contentType = response.headers.get("content-type");
      let data: any;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          data?.message || data?.error || `HTTP ${response.status}`;
        console.error(`[ApiService] Request failed: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      console.log(`[ApiService] ✅ Request successful`);
      return data;
    } catch (error) {
      console.error(`[ApiService] ❌ Request error:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  public async get<T = any>(
    endpoint: string,
    options: Omit<RequestOptions, "method" | "body"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  public async post<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  public async put<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    options: Omit<RequestOptions, "method" | "body"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * Upload file with form data
   */
  public async upload<T = any>(
    endpoint: string,
    formData: FormData,
    options: Omit<RequestOptions, "method" | "body" | "headers"> = {}
  ): Promise<T> {
    const authHeaders = await authService.getAuthHeaders();
    if (!authHeaders) {
      throw new Error("Authentication required");
    }

    // Don't set Content-Type for FormData, let the browser set it with boundary
    const { Authorization } = authHeaders;

    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      headers: { Authorization },
      body: formData,
    });
  }

  /**
   * Health check endpoint (non-authenticated)
   */
  public async healthCheck(): Promise<any> {
    return this.get("/health", { authenticated: false });
  }

  /**
   * Get current API base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export convenience functions for direct use
export const {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  healthCheck,
} = apiService;
