// src/services/csrf.service.ts - Create this new file
export class CSRFService {
  private static token: string | null = null;
  private static tokenExpiry: number = 0;

  static async getToken(): Promise<string> {
    // Check if token exists and is not expired
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.csrfToken) {
        this.token = data.csrfToken;
        // Set expiry to 50 minutes (token expires in 1 hour)
        this.tokenExpiry = Date.now() + 50 * 60 * 1000;
        return this.token as string;
      } else {
        throw new Error("Invalid CSRF token response");
      }
    } catch (error) {
      console.error("CSRF token fetch failed:", error);
      throw new Error(
        "Unable to obtain CSRF protection. Please refresh the page."
      );
    }
  }

  static clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
  }

  static async refreshToken(): Promise<string> {
    this.clearToken();
    return this.getToken();
  }
}

// Enhanced API request utility with CSRF protection
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    // Get CSRF token for non-GET requests
    let csrfToken = "";
    const method = options.method?.toUpperCase() || "GET";

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      csrfToken = await CSRFService.getToken();
    }

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add CSRF token if needed
    if (csrfToken) {
      defaultHeaders["X-CSRF-Token"] = csrfToken;
    }

    const requestOptions: RequestInit = {
      credentials: "include",
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, requestOptions);

    // Handle CSRF token validation errors
    if (response.status === 403) {
      const errorText = await response.text();
      if (errorText.includes("CSRF") || errorText.includes("csrf")) {
        // CSRF token might be invalid, refresh and retry
        console.warn("CSRF token validation failed, refreshing token...");
        await CSRFService.refreshToken();

        // Retry request with new token
        if (csrfToken) {
          const newToken = await CSRFService.getToken();
          requestOptions.headers = {
            ...requestOptions.headers,
            "X-CSRF-Token": newToken,
          };
          return fetch(url, requestOptions);
        }
      }
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Convenience methods for common HTTP operations
export const api = {
  get: (url: string, options: RequestInit = {}) =>
    apiRequest(url, { method: "GET", ...options }),

  post: (url: string, data?: unknown, options: RequestInit = {}) =>
    apiRequest(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  put: (url: string, data?: unknown, options: RequestInit = {}) =>
    apiRequest(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  delete: (url: string, options: RequestInit = {}) =>
    apiRequest(url, { method: "DELETE", ...options }),
};
