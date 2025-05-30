export interface UserSettings {
  currency: "USD" | "EUR" | "TND";
  currencyIntroSeen: boolean;
  haptics: boolean;
}
const settingsStore: Record<string, UserSettings> = {
  "mouhamedaminkraiem09@gmail.com": {
    currency: "USD",
    currencyIntroSeen: false,
    haptics: true,
  },
};

export const fetchUserSettings = (email: string): Promise<UserSettings> =>
  new Promise((res) => setTimeout(() => res(settingsStore[email]), 300));

export const setCurrencyIntroSeen = (email: string): Promise<void> =>
  new Promise((res) =>
    setTimeout(() => {
      settingsStore[email].currencyIntroSeen = true;
      res();
    }, 200)
  );

export const updateCurrency = (
  email: string,
  newCurrency: UserSettings["currency"]
): Promise<void> =>
  new Promise((res) =>
    setTimeout(() => {
      settingsStore[email].currency = newCurrency;
      console.log(`📡  [fake] currency updated → ${newCurrency}`);
      res();
    }, 300)
  );

export const updateHaptics = (email: string, enabled: boolean): Promise<void> =>
  new Promise((res) =>
    setTimeout(() => {
      settingsStore[email].haptics = enabled;
      res();
    }, 200)
  );
