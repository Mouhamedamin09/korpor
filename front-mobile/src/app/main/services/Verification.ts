// @main/services/Verification.ts

export interface VerificationResult {
  qualified: boolean;
  message?: string;
}
export interface VerificationStatus {
  identity: VerificationResult;
  address: VerificationResult;
}

// module‐level storage for our fake backend
let _identityResult: VerificationResult = { qualified: false };
let _addressResult: VerificationResult = { qualified: false };

/**
 * Called from VerificationProgressScreen when user taps “Next”
 * with their passport + selfie URIs.
 */
export async function submitIdentityVerification(
  passportUri: string,
  selfieUri: string
): Promise<VerificationResult> {
  await new Promise((r) => setTimeout(r, 1000));
  const ok =
    passportUri.startsWith("file://") && selfieUri.startsWith("file://");
  _identityResult = {
    qualified: ok,
    message: ok ? undefined : "Qualification didn’t work exactly as expected.",
  };
  return _identityResult;
}

/**
 * Called from AddressProgressScreen when user taps “Next”
 */
export async function submitAddressVerification(
  addressUri: string
): Promise<VerificationResult> {
  await new Promise((r) => setTimeout(r, 1000));
  // for fake backend we always accept
  _addressResult = { qualified: true };
  return _addressResult;
}

/**
 * Polled by CompleteAccountSetupScreen & ProfileScreen
 */
export async function fetchVerificationStatus(): Promise<VerificationStatus> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    identity: _identityResult,
    address: _addressResult,
  };
}
