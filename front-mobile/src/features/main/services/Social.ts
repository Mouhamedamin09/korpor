// @main/services/Social.ts

export type SocialMethod = "google" | "email";

let _currentMethod: SocialMethod = "google"; // mock persisted value

/** Fetch which method the user signed up with */
export async function fetchSocialMethod(): Promise<SocialMethod> {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 500));
  return _currentMethod;
}

/** Disconnect the given social method */
export async function revokeSocial(method: SocialMethod): Promise<void> {
  await new Promise((r) => setTimeout(r, 500));
  if (_currentMethod === method) {
    // for demo, fall back to email login
    _currentMethod = "email";
  }
}
