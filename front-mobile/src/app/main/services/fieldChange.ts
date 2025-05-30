/**************************************************************************
 🔹  Phone & E-mail change helpers (legacy-compatible)
      • Signature:  requestFieldChange(userEmail, field, newValue)
                    verifyFieldChange (userEmail, field, code)
      • Works with the API spec you posted
      • Safe-parses non-JSON error bodies (404 HTML, etc.)
 **************************************************************************/

import EV_API_URL from "src/shared/constants/api";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                    */
/* ------------------------------------------------------------------ */

/**  True if the response looks like JSON. */
const isJSON = (res: Response): boolean =>
  res.headers.get("content-type")?.includes("application/json") ?? false;

/**  Replace with your real auth logic. */
const getUserId = (): number => {
  // TODO: Replace this with your actual auth system's way of getting the user ID
  return 1; // Temporary fallback
};

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface FieldChangeResponse {
  ok: boolean;
  message?: string;
  code?: string;
}

export interface VerificationResponse {
  ok: boolean;
  message?: string;
  newValue?: string;
}

/* ------------------------------------------------------------------ */
/*  1.  Request phone / e-mail change                                 */
/* ------------------------------------------------------------------ */

/**
 * Request a change to the user's phone or e-mail.
 *
 * @param userEmail  The user's email
 * @param field      "phone" | "email"
 * @param newValue   The new phone ("+216…") or e-mail
 */
export const requestFieldChange = async (
  userEmail: string,
  field: "email" | "phone",
  newValue: string
): Promise<FieldChangeResponse> => {
  try {
    const userId = getUserId();
    if (!userId) {
      return { ok: false, message: "User not authenticated" };
    }

    // Log request details
    console.log(`📱 Requesting ${field} change:`, {
      userId,
      newValue,
      apiUrl: EV_API_URL
    });

    // Make API request
    const response = await fetch(
      `${EV_API_URL}/api/user/request-${field}-change`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          userId,
          [`new${field.charAt(0).toUpperCase() + field.slice(1)}`]: newValue,
        }),
      }
    );

    // Log response status
    console.log(`📱 ${field} change response status:`, response.status);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`📱 ${field} change error: Non-JSON response`, {
        status: response.status,
        contentType,
        url: response.url
      });
      return {
        ok: false,
        message: `Server error: Invalid response format (${response.status})`
      };
    }

    // Parse response
    const data = await response.json();
    console.log(`📱 ${field} change response data:`, data);

    if (!response.ok) {
      return {
        ok: false,
        message: data.error || `Failed to request ${field} change`,
      };
    }

    return {
      ok: true,
      message: data.message,
      code: data.code, // In development, backend may return the code for testing
    };
  } catch (error: any) {
    console.error(`📱 ${field} change error:`, error);
    return {
      ok: false,
      message: `Network error: ${error?.message || "Unknown error"}`,
    };
  }
};

/* ------------------------------------------------------------------ */
/*  2.  Verify phone / e-mail change                                  */
/* ------------------------------------------------------------------ */

/**
 * Verify the pending change using the 6-digit code.
 *
 * @param userEmail       The user's email
 * @param field           "phone" | "email"
 * @param verificationCode 6-digit code sent via SMS / e-mail
 */
export const verifyFieldChange = async (
  userEmail: string,
  field: "email" | "phone",
  verificationCode: string
): Promise<VerificationResponse> => {
  try {
    const userId = getUserId();
    if (!userId) {
      return { ok: false, message: "User not authenticated" };
    }

    // Log verification attempt
    console.log(`📱 Verifying ${field}:`, {
      userId,
      verificationCode,
      apiUrl: EV_API_URL
    });

    // Make API request
    const response = await fetch(
      `${EV_API_URL}/api/user/verify-${field}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          userId,
          verificationCode,
        }),
      }
    );

    // Log response status
    console.log(`📱 ${field} verification response status:`, response.status);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`📱 ${field} verification error: Non-JSON response`, {
        status: response.status,
        contentType,
        url: response.url
      });
      return {
        ok: false,
        message: `Server error: Invalid response format (${response.status})`
      };
    }

    // Parse response
    const data = await response.json();
    console.log(`📱 ${field} verification response data:`, data);

    if (!response.ok) {
      return {
        ok: false,
        message: data.error || `Failed to verify ${field}`,
      };
    }

    return {
      ok: true,
      message: data.message,
      newValue: data.newValue,
    };
  } catch (error: any) {
    console.error(`📱 ${field} verification error:`, error);
    return {
      ok: false,
      message: `Network error: ${error?.message || "Unknown error"}`,
    };
  }
};

/* ------------------------------------------------------------------ */
/*  3.  Legacy stubs (unchanged)                                      */
/* ------------------------------------------------------------------ */

/**
 * Update an account field (legacy function, kept for compatibility)
 */
export const updateAccountField = (
  userEmail: string,
  field: "email" | "phone",
  newValue: string
): Promise<void> =>
  new Promise((resolve) => {
    console.log(`📡 [Legacy] Updating ${field}=${newValue} for ${userEmail}`);
    setTimeout(resolve, 300);
  });

/**
 * Request account closure (legacy function, kept for compatibility)
 */
export const requestAccountClosure = (email: string): Promise<void> =>
  new Promise((resolve) => {
    console.log(`📡 [Legacy] Delete account request for ${email}`);
    setTimeout(resolve, 800);
  });
