// services/account.ts
export interface AccountData {
  name: string;
  email: string;
  phone: string;
  accountType: string;
  korporSince: string;
  intro: string;
  investmentUsedPct: number;
  investmentTotal: number;
  globalUsers: number;
  globalCountries: number;
}

/** Fake “GET /profile” – returns a fixed payload after 400 ms. */
export const fetchAccountData = (): Promise<AccountData> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          name: "Amin Kraiem",
          email: "mouhamedaminkraiem09@gmail.com",
          phone: "+21629453228",
          accountType: "Individual Account",
          korporSince: "Mar 11, 2025",
          intro: "Korpor Intro",
          investmentUsedPct: 0,
          investmentTotal: 367_000,
          globalUsers: 1_000_000,
          globalCountries: 209,
        }),
      400
    )
  );
