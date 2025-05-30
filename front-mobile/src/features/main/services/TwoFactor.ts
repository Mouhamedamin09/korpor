// @main/services/TwoFactor.ts

export interface AuthSetupResponse {
  secret: string; // Base32 TOTP secret
  otpauthUrl: string; // otpauth:// URL for QR
}

// Fake in-memory storage
let _secret = "JBSWY3DPEHPK3PXP";
let _otpauthUrl = `otpauth://totp/Korpor:user@example.com?secret=${_secret}&issuer=Korpor`;

/**
 * Fetches a new TOTP secret + QR URL from the backend.
 */
export async function fetchAuthSetup(): Promise<AuthSetupResponse> {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  return {
    secret: _secret,
    otpauthUrl: _otpauthUrl,
  };
}

/**
 * Verifies the 6-digit code against the TOTP secret.
 */
export async function verifyAuthCode(
  secret: string,
  code: string
): Promise<boolean> {
  // simulate network + server-side TOTP check
  await new Promise((r) => setTimeout(r, 500));
  // 🔒 demo only: accept “123456” as valid
  return code === "123456";
}
