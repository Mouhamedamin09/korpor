export interface HelpCollection {
  id: string;
  label: string;
  articleIds: string[];
}
export interface HelpArticle {
  id: string;
  title: string;
  updated: string;
  author: { name: string; avatar: string };
  body: string;
}

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
    body: "### Annual appreciation\nProjecte...",
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

export interface SearchHit {
  id: string;
  title: string;
  snippet: string;
}

export const searchArticles = (term: string): Promise<SearchHit[]> =>
  new Promise((res) => {
    const q = term.trim().toLowerCase();
    if (!q) return res([]);
    const hits: SearchHit[] = [];
    Object.values(HELP_ARTICLES).forEach((a) => {
      const titleIdx = a.title.toLowerCase().indexOf(q);
      if (titleIdx >= 0) {
        const snippet =
          a.title.slice(0, titleIdx) +
          "**" +
          a.title.slice(titleIdx, titleIdx + q.length) +
          "**" +
          a.title.slice(titleIdx + q.length);
        hits.push({ id: a.id, title: a.title, snippet });
        return;
      }
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
