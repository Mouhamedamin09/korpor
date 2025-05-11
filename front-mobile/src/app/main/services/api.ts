/* ---------------------------------------------------------------------------
   services/api.ts   (💡 **FAKE backend used only by the demo front-end**)
   ---------------------------------------------------------------------------
   This file fakes a tiny backend with the following capabilities:

   1.  Return a hard-coded user profile  (fetchAccountData)
   2.  Start an email/phone change flow:
         • /requestFieldChange     – STEP-1  validate + generate OTP
         • /verifyFieldChange      – STEP-2  confirm OTP + commit change
       -- with a 60-day throttle per field
   3.  Pretend to “store” the new field (updateAccountField)
   4.  Pretend to handle an account-closure request (requestAccountClosure)

   Every “network” call is a Promise + setTimeout; _nothing_ is persisted.
   Replace each stub with real DB / email / SMS logic in production.
---------------------------------------------------------------------------- */

/* ╔═══════════════════════════════════════════════════════════════════════╗
   ║  1.  Profile type + seed fetch                                        ║
   ╚═══════════════════════════════════════════════════════════════════════╝ */

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

/**
 * Fake “GET /profile” – returns a fixed payload after 400 ms.
 * Replace with a DB query in real life.
 */
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

/* ╔═══════════════════════════════════════════════════════════════════════╗
   ║  2.  In-memory state for OTP & throttle (DEMO ONLY!)                  ║
   ╚═══════════════════════════════════════════════════════════════════════╝ */

/** pending[userEmail].email / .phone = { token, newValue, expires } */
interface Pending {
  token: string; // 6-digit OTP
  newValue: string; // value we want to set if OTP verified
  expires: number; // epoch ms – 10-minute life span
}
const pending: Record<string, { email?: Pending; phone?: Pending }> = {};

/** lastChange[userEmail] = timestamps of last successful change */
const lastChange: Record<string, { email: number; phone: number }> = {};

/* little helpers */
const now = () => Date.now();
const randomOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/** throttle = 60 days in ms */
const THROTTLE_MS = 60 * 24 * 60 * 60 * 1000;

/* ╔═══════════════════════════════════════════════════════════════════════╗
   ║  3.  STEP-1  requestFieldChange                                       ║
   ╚═══════════════════════════════════════════════════════════════════════╝ */

/**
 * Called when user presses “Save Changes”.
 * Returns { ok:false, message } if:
 *   • still within the 60-day cooldown, OR
 *   • any other validation failed (not simulated here).
 * On success:
 *   • generates a 6-digit OTP,
 *   • stores it in `pending`,
 *   • prints it to console (simulate email/SMS),
 *   • returns { ok:true } so UI shows the “Enter code” screen.
 */
export const requestFieldChange = async (
  userEmail: string,
  field: "email" | "phone",
  newValue: string
): Promise<{ ok: boolean; message?: string }> => {
  /* 1) Cool-down check --------------------------------------------------- */
  const last = lastChange[userEmail]?.[field] ?? 0;
  if (now() - last < THROTTLE_MS) {
    const daysLeft = Math.ceil((THROTTLE_MS - (now() - last)) / 86_400_000);
    return {
      ok: false,
      message: `You can change your ${field} again in ${daysLeft} day(s).`,
    };
  }

  /* 2) Generate + store OTP --------------------------------------------- */
  const token = randomOTP();

  pending[userEmail] = pending[userEmail] || {};
  pending[userEmail][field] = {
    token,
    newValue,
    expires: now() + 10 * 60 * 1000, // 10-minute window
  };

  /* 3) “Send” code (here just console.log) ------------------------------ */
  console.log(`📡  [fake] sent OTP ${token} for ${field} change → ${newValue}`);

  return { ok: true };
};

/* ╔═══════════════════════════════════════════════════════════════════════╗
   ║  4.  STEP-2  verifyFieldChange                                        ║
   ╚═══════════════════════════════════════════════════════════════════════╝ */

/**
 * Called when user enters the 6-digit code and taps “Verify”.
 * Returns { ok:false } on failure – UI should show “Invalid code”.
 * On success:
 *   • deletes pending request,
 *   • records timestamp in `lastChange` (re-starts 60-day timer),
 *   • returns { ok:true, newValue } so UI updates immediately.
 */
export const verifyFieldChange = async (
  userEmail: string,
  field: "email" | "phone",
  token: string
): Promise<{ ok: boolean; newValue?: string }> => {
  const p = pending[userEmail]?.[field];

  /* 1) Validate token & expiry ------------------------------------------ */
  if (!p || p.expires < now() || p.token !== token) {
    return { ok: false };
  }

  /* 2) Commit change (real backend would write to DB) -------------------- */
  delete pending[userEmail][field];

  lastChange[userEmail] = lastChange[userEmail] || { email: 0, phone: 0 };
  lastChange[userEmail][field] = now();

  console.log(`✅  [fake] ${field} verified for ${userEmail} → ${p.newValue}`);

  return { ok: true, newValue: p.newValue };
};

/* ╔═══════════════════════════════════════════════════════════════════════╗
   ║  5.  updateAccountField – local store “success”                       ║
   ╚═══════════════════════════════════════════════════════════════════════╝ */

/**
 * Tiny helper so the front-end shows the new value immediately.
 * In real life the DB update already happened in STEP-2, so this
 * function becomes unnecessary or just re-fetches the fresh user row.
 */
export const updateAccountField = (
  userEmail: string,
  field: "email" | "phone",
  newValue: string
): Promise<void> =>
  new Promise((resolve) => {
    console.log(`📡  [fake] stored ${field}=${newValue} for ${userEmail}`);
    setTimeout(resolve, 300);
  });

/* ╔═══════════════════════════════════════════════════════════════════════╗
   ║  6.  requestAccountClosure – placeholder                              ║
   ╚═══════════════════════════════════════════════════════════════════════╝ */

export const requestAccountClosure = (email: string): Promise<void> =>
  new Promise((resolve) => {
    console.log(`📡  delete-account request for ${email}`);
    setTimeout(resolve, 800);
  });

/* -----------------------------------------------------------------------
   END  (Swap every console.log + setTimeout with real persistence / email
         / SMS provider calls in production.)
------------------------------------------------------------------------- */

/* ---------- user settings store --------------------------------------- */
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
  new Promise((r) => setTimeout(() => r(settingsStore[email]), 300));

export const setCurrencyIntroSeen = (email: string): Promise<void> =>
  new Promise((r) =>
    setTimeout(() => {
      settingsStore[email].currencyIntroSeen = true;
      r();
    }, 200)
  );

export const updateCurrency = (
  email: string,
  newCurrency: UserSettings["currency"]
): Promise<void> =>
  new Promise((r) =>
    setTimeout(() => {
      settingsStore[email].currency = newCurrency;
      console.log(`📡  [fake] currency updated → ${newCurrency}`);
      r();
    }, 300)
  );

export const updateHaptics = (email: string, enabled: boolean): Promise<void> =>
  new Promise((r) =>
    setTimeout(() => {
      settingsStore[email].haptics = enabled;
      r();
    }, 200)
  );

/* ───────────────────────── HELP CENTER DATA ─────────────────────────── */

export interface HelpCollection {
  id: string; // "about-stake"
  label: string; // "About Stake"
  articleIds: string[]; // ["glossary", "why-invest", ...]
}
export interface HelpArticle {
  id: string; // "glossary"
  title: string; // "Glossary"
  updated: string; // "2024-09-18"
  author: { name: string; avatar: string };
  body: string; // markdown / plain html
}

/* in-memory data */
const HELP_COLLECTIONS: HelpCollection[] = [
  {
    id: "about-stake",
    label: "About Stake",
    articleIds: ["glossary", "why-invest", "how-to-begin"],
  },
  { id: "tunisia", label: "Tunisia", articleIds: ["tun-tax", "tun-kyc"] },
  { id: "france", label: "France", articleIds: ["fr-tax", "fr-kyc"] },
];

const HELP_ARTICLES: Record<string, HelpArticle> = {
  glossary: {
    id: "glossary",
    title: "Glossary",
    updated: "2024-09-18",
    author: { name: "Ahmed Jaziri", avatar: "Ahmed.png" },
    body: "### Annual appreciation\nProjecte..." /* ← your long content */,
  },
  "why-invest": {
    id: "why-invest",
    title: "Why invest in real estate?",
    updated: "2024-10-01",
    author: { name: "Sara Ben Ali", avatar: "Ahmed.png" },
    body: "Real estate historically outperforms …",
  },
  "how-to-begin": {
    id: "how-to-begin",
    title: "How do I begin?",
    updated: "2024-10-05",
    author: { name: "Sara Ben Ali", avatar: "Ahmed.png" },
    body: "Create an account, complete KYC, …",
  },
  "tun-tax": {
    id: "tun-tax",
    title: "Tax obligations in Tunisia",
    updated: "2024-08-11",
    author: { name: "Khaled Mansour", avatar: "Ahmed.png" },
    body: "As a Tunisian resident investor …",
  },
  "tun-kyc": {
    id: "tun-kyc",
    title: "KYC in Tunisia",
    updated: "2024-07-22",
    author: { name: "Khaled Mansour", avatar: "Ahmed.png" },
    body: "All investors are required to …",
  },
  "fr-tax": {
    id: "fr-tax",
    title: "Tax obligations in France",
    updated: "2024-06-30",
    author: { name: "Camille Dupont", avatar: "Ahmed.png" },
    body: "French residents must declare …",
  },
  "fr-kyc": {
    id: "fr-kyc",
    title: "KYC in France",
    updated: "2024-05-25",
    author: { name: "Camille Dupont", avatar: "Ahmed.png" },
    body: "The AMF requires …",
  },
};

/* API helpers */
export const fetchHelpCollections = (): Promise<HelpCollection[]> =>
  new Promise((res) => setTimeout(() => res(HELP_COLLECTIONS), 250));

export const fetchArticlesByCollection = (
  collectionId: string
): Promise<HelpArticle[]> =>
  new Promise((res) =>
    setTimeout(
      () =>
        res(
          HELP_COLLECTIONS.find((c) => c.id === collectionId)?.articleIds.map(
            (id) => HELP_ARTICLES[id]
          ) || []
        ),
      250
    )
  );

export const fetchArticle = (id: string): Promise<HelpArticle | undefined> =>
  new Promise((res) => setTimeout(() => res(HELP_ARTICLES[id]), 200));

/* ╔═══════════════════════════════════════════════════════════════════════╗
   ║  7.  Full-text search in help articles                                ║
   ╚═══════════════════════════════════════════════════════════════════════╝ */

export interface SearchHit {
  id: string; // article id
  title: string;
  snippet: string; // markdown-style bold snippet
}

/**
 * Naive, case-insensitive search over title + body.
 * – If the term is found in the **title**, the whole title is returned
 *   with the term bolded.
 * – Otherwise a 30-char body snippet is returned with the term bolded.
 * – At most 20 hits.
 */
export const searchArticles = (term: string): Promise<SearchHit[]> =>
  new Promise((res) => {
    const q = term.trim().toLowerCase();
    if (!q) return res([]);

    const hits: SearchHit[] = [];

    Object.values(HELP_ARTICLES).forEach((a) => {
      /* ---------- 1) look inside the title first ----------------------- */
      const titleIdx = a.title.toLowerCase().indexOf(q);
      if (titleIdx >= 0) {
        const snippet =
          a.title.slice(0, titleIdx) +
          "**" +
          a.title.slice(titleIdx, titleIdx + q.length) +
          "**" +
          a.title.slice(titleIdx + q.length);

        hits.push({ id: a.id, title: a.title, snippet });
        return; // done with this article
      }

      /* ---------- 2) look inside the body ------------------------------ */
      const bodyIdx = a.body.toLowerCase().indexOf(q);
      if (bodyIdx >= 0) {
        const start = Math.max(0, bodyIdx - 15);
        const end = Math.min(a.body.length, bodyIdx + q.length + 15);
        const snippet =
          (start > 0 ? "…" : "") +
          a.body.slice(start, bodyIdx) +
          "**" +
          a.body.slice(bodyIdx, bodyIdx + q.length) +
          "**" +
          a.body.slice(bodyIdx + q.length, end) +
          (end < a.body.length ? "…" : "");

        hits.push({ id: a.id, title: a.title, snippet });
      }
    });

    res(hits.slice(0, 20));
  });

/* ╔═══════════════════════════════════════════════════════════════════════╗
   ║  8.  Live-chat admins                                                ║
   ╚═══════════════════════════════════════════════════════════════════════╝ */

export interface LiveChatAgent {
  id: string;
  name: string;
  avatar?: string; // remote URL or local asset path
}

/* pretend these come from your back-office DB */
const CHAT_AGENTS: LiveChatAgent[] = [
  {
    id: "georges",
    name: "Georges N.",
    avatar: "https://i.pravatar.cc/64?u=georges",
  },
  {
    id: "amel",
    name: "Amel D.",
    avatar: "https://i.pravatar.cc/64?u=amel",
  },
  {
    id: "rachid",
    name: "Rachid K.",
    avatar: undefined, // missing avatar example
  },
];

/** GET /live-chat/agents */
export const fetchLiveChatAgents = (): Promise<LiveChatAgent[]> =>
  new Promise((res) => setTimeout(() => res(CHAT_AGENTS), 250));
