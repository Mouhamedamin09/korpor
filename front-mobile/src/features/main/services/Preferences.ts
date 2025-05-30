// @main/services/Preferences.ts

export type Market = "Tunisia" | "France";
export type Preference = "all" | "local";

export interface UserPreferences {
  region: Market;
  preference: Preference;
}

// In-memory “backend”
let _prefs: UserPreferences = {
  region: "Tunisia",
  preference: "all",
};

/**
 * Fetch current user preferences
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 500));
  return { ..._prefs };
}

/**
 * Update the preference on the server
 */
export async function setUserPreference(
  preference: Preference
): Promise<UserPreferences> {
  await new Promise((r) => setTimeout(r, 500));
  _prefs.preference = preference;
  return { ..._prefs };
}
