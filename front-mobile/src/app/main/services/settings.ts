import { switchCurrency as switchReferralCurrency } from './Refer';

export interface UserSettings {
  currency: "USD" | "EUR" | "TND";
  currencyIntroSeen: boolean;
  haptics: boolean;
}

const settingsStore: Record<string, UserSettings> = {
  "mouhamedaminkraiem09@gmail.com": {
    currency: "TND", // Default to TND - USD, EUR, TND all supported for display
    currencyIntroSeen: false,
    haptics: true,
  },
};

export const fetchUserSettings = async (email: string): Promise<UserSettings> => {
  try {
    // Initialize default settings if user doesn't exist
    if (!settingsStore[email]) {
      settingsStore[email] = {
        currency: "TND", // Default to TND
        currencyIntroSeen: false,
        haptics: true,
      };
    }
    
    // Return the user's stored preference (preserve their currency choice)
    return new Promise((resolve) => 
      setTimeout(() => resolve(settingsStore[email]), 300)
    );
  } catch (error) {
    console.error('Error fetching user settings:', error);
    // Fallback to local store
    return new Promise((resolve) => 
      setTimeout(() => resolve(settingsStore[email] || {
        currency: "TND",
        currencyIntroSeen: false,
        haptics: true,
      }), 300)
    );
  }
};

export const setCurrencyIntroSeen = (email: string): Promise<void> =>
  new Promise((res) =>
    setTimeout(() => {
      if (settingsStore[email]) {
        settingsStore[email].currencyIntroSeen = true;
      }
      res();
    }, 200)
  );

export const updateCurrency = async (
  email: string,
  newCurrency: UserSettings["currency"]
): Promise<void> => {
  try {
    // For backend compatibility: USD maps to TND, EUR stays EUR
    const backendCurrency = newCurrency === "EUR" ? "EUR" : "TND";
    
    // Update currency in backend (this affects referral amounts, etc.)
    await switchReferralCurrency(backendCurrency);
    
    // Always update local store with the user's actual preference
    if (settingsStore[email]) {
      settingsStore[email].currency = newCurrency; // Keep USD, EUR, or TND as selected
    } else {
      settingsStore[email] = {
        currency: newCurrency,
        currencyIntroSeen: false,
        haptics: true,
      };
    }
    
    console.log(`📡 Currency updated → ${newCurrency} (backend: ${backendCurrency})`);
  } catch (error) {
    console.error('Error updating currency:', error);
    
    // Fallback to local update - still keep user's preference
    return new Promise((res) =>
      setTimeout(() => {
        if (settingsStore[email]) {
          settingsStore[email].currency = newCurrency;
        } else {
          settingsStore[email] = {
            currency: newCurrency,
            currencyIntroSeen: false,
            haptics: true,
          };
        }
        console.log(`📡 [fallback] currency updated → ${newCurrency}`);
        res();
      }, 300)
    );
  }
};

export const updateHaptics = (email: string, enabled: boolean): Promise<void> =>
  new Promise((res) =>
    setTimeout(() => {
      settingsStore[email].haptics = enabled;
      res();
    }, 200)
  );
