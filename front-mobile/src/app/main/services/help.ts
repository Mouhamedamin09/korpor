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

export const HELP_COLLECTIONS: HelpCollection[] = [
  {
    id: "about-korpor",
    label: "About Korpor",
    articleIds: [
      "korpor-overview",
      "korpor-ceo",
      "korpor-features",
      "korpor-faq",
      "korpor-security",
      "korpor-vision",
    ],
  },
  {
    id: "tunisia",
    label: "Tunisia",
    articleIds: [
      "tunisia-market-overview",
      "tunisia-legal-framework",
      "tunisia-kyc-requirements",
      "tunisia-taxation",
      "tunisia-investment-process",
      "tunisia-common-questions",
      "tunisia-faq",
    ],
  },
  {
    id: "france",
    label: "France",
    articleIds: [
      "france-market-overview",
      "france-legal-framework",
      "france-kyc-requirements",
      "france-taxation",
      "france-investment-process",
      "france-common-questions",
      "france-faq",
    ],
  },
];

export const HELP_ARTICLES: Record<string, HelpArticle> = {
  // ─── About Korpor ───────────────────────────────────────────────────────────
  "korpor-overview": {
    id: "korpor-overview",
    title: "What is Korpor?",
    updated: "2025-3-25",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `Korpor is a digital real-estate investment platform enabling users to buy fractional ownership of carefully vetted properties in Tunisia and France.

By pooling capital, Korpor lowers entry barriers—letting individuals participate in property markets with as little as USD 100.

Leveraging blockchain-inspired ledger technology, every share is transparently recorded, ensuring immutable ownership history.

The platform handles property sourcing, due diligence, and ongoing asset management, while investors track performance in real time.`,
  },
  "korpor-ceo": {
    id: "korpor-ceo",
    title: "Meet our CEO: Khalil Zouari",
    updated: "2025-05-26",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `Khalil Zouari founded Korpor in 2025 with a vision to democratize property investment across MENA and Europe.

With a background in fintech and property development, Khalil has led Korpor through two funding rounds, raising over USD 20 million.

He oversees platform strategy, strategic partnerships in Tunisia and France, and drives product innovation—ensuring Korpor remains at the forefront of fractional real estate.

All official documents and filings (e.g., incorporation papers, regulatory submissions) are under his name, Khalil Zouari.`,
  },
  "korpor-features": {
    id: "korpor-features",
    title: "Key Features of Korpor",
    updated: "2024-12-27",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `• **Fractional Ownership**: Buy "shares" of residential, commercial, or mixed-use properties.

• **Auto-Reinvest**: Dividends can be automatically reinvested into new offerings.

• **Secondary Market**: Trade your shares with other Korpor users for liquidity.

• **Dashboard Analytics**: Track rental yields, property valuations, and portfolio diversification.

• **Regulatory Compliance**: Full adherence to AMF (France) and CMF (Tunisia) guidelines.`,
  },
  "korpor-faq": {
    id: "korpor-faq",
    title: "Korpor FAQ",
    updated: "2025-2-18",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `**Q: How do I sign up?**
A: Create an account, complete KYC, link your bank, and you're ready to invest.

**Q: What's the minimum investment?**
A: USD 100 per property.

**Q: When do I get returns?**
A: Quarterly, based on rental income and any capital gains events.`,
  },
  "korpor-security": {
    id: "korpor-security",
    title: "Security & Data Protection",
    updated: "2024-12-29",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `We employ bank-grade encryption (AES-256) for data at rest and TLS 1.3 for data in transit.

All identity documents are stored on secure, GDPR- and CNIL-compliant servers.

Multi-factor authentication is mandatory for withdrawals or secondary-market trades.

Regular third-party security audits ensure platform integrity; audit summaries are available upon request.`,
  },
  "korpor-vision": {
    id: "korpor-vision",
    title: "Our Vision & Roadmap",
    updated: "2024-12-30",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `By end-2025, Korpor aims to expand into Spain and Portugal, adding southern-Europe portfolios.

We plan to introduce AI-driven property valuations and predictive rental-income models by Q1 2026.

Our long-term mission: become the leading pan-Mediterranean real-estate investment network.`,
  },

  // ─── Tunisia ────────────────────────────────────────────────────────────────
  "tunisia-market-overview": {
    id: "tunisia-market-overview",
    title: "Tunisia Real-Estate Market Overview",
    updated: "2024-11-26",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `Tunisia's property market is anchored by strong urban demand in Tunis, Sfax, and Sousse.

Residential yields average 6–8% annually; prime commercial spaces can exceed 9%.

Foreigners benefit from streamlined registration since the 2016 investment code reform.

Korpor selects assets with proven cash-flow history and growth potential near emerging economic zones.`,
  },
  "tunisia-legal-framework": {
    id: "tunisia-legal-framework",
    title: "Legal & Regulatory Framework in Tunisia",
    updated: "2024-11-27",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `All land transfers are recorded at the Conservatoire National des Terrains.

Foreign investors must register with the Foreign Investment Promotion Agency (FIPA).

Since 2016, Law n° 2016-71 provides equal treatment for foreign and domestic investors.

Korpor's legal team handles all notarial deeds (acte authentique) and land-title searches on your behalf.`,
  },
  "tunisia-kyc-requirements": {
    id: "tunisia-kyc-requirements",
    title: "KYC & Onboarding in Tunisia",
    updated: "2024-11-28",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `Required documents:
• Valid passport or national ID
• Proof of address (utility bill under 3 months old)
• Bank statement for source-of-fund verification

All submissions are encrypted; approval typically takes 24–48 hours.`,
  },
  "tunisia-taxation": {
    id: "tunisia-taxation",
    title: "Tax Obligations in Tunisia",
    updated: "2024-11-29",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `Rental income is taxed at a flat 15% withholding rate for non-residents.

Capital gains on property sales incur 20% tax after a five-year holding period.

Korpor provides annual tax statements to simplify your filings.

Consult a local tax advisor for personal circumstances.`,
  },
  "tunisia-investment-process": {
    id: "tunisia-investment-process",
    title: "How to Invest in Tunisia with Korpor",
    updated: "2024-12-02",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `1. Sign up & complete KYC.
2. Browse Tunisian offerings & review due-diligence packs.
3. Commit capital (starting at USD 100).
4. Receive digital ownership certificate on platform.
5. Monitor quarterly dividends and valuations.`,
  },
  "tunisia-common-questions": {
    id: "tunisia-common-questions",
    title: "Common Questions: Tunisia",
    updated: "2024-12-03",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `**Q: Can I transfer ownership to a family member?**
A: Yes—submit a transfer request; notarial fees apply.

**Q: Are there currency-exchange controls?**
A: No restrictions for incoming investment; repatriation of proceeds is straightforward.`,
  },
  "tunisia-faq": {
    id: "tunisia-faq",
    title: "Tunisia FAQ",
    updated: "2024-12-05",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `**What is the minimum holding period?**
There is no hard lock-in; however, capital gains tax benefits begin after five years.

**How do I exit my investment?**
Use Korpor's secondary market or request a redemption during quarterly windows.`,
  },

  // ─── France ─────────────────────────────────────────────────────────────────
  "france-market-overview": {
    id: "france-market-overview",
    title: "France Real-Estate Market Overview",
    updated: "2024-11-25",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `France remains a top EU destination—Paris, Lyon, and Bordeaux lead in yield and capital appreciation.

Average gross rental yields range 4–6%, with strong long-term capital gains drive.

Korpor hand-picks properties near transit hubs and high-growth suburbs.`,
  },
  "france-legal-framework": {
    id: "france-legal-framework",
    title: "Legal & Regulatory Framework in France",
    updated: "2024-11-26",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `All sales require a notaire to draft the acte de vente.

Foreign investors face no purchase restrictions but must register with the French Land Registry (cadastre).

Since 2014, anti-money-laundering (AML) laws mandate enhanced due diligence.

Korpor covers all notarial and registry fees as part of your offering pack.`,
  },
  "france-kyc-requirements": {
    id: "france-kyc-requirements",
    title: "KYC & Onboarding in France",
    updated: "2024-11-27",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `Required for EU/non-EU alike:
• Valid passport or national ID
• Proof of address (utility bill < 3 months)
• Source-of-fund documentation (e.g., recent bank statement)

E-sign your mandate with a qualified electronic signature within 24 hours.`,
  },
  "france-taxation": {
    id: "france-taxation",
    title: "Tax Obligations in France",
    updated: "2024-11-28",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `Rental income is taxed at progressive rates up to 30% for non-residents (with allowances possible under double-tax treaties).

Capital gains incur 19% plus social contributions at 17.2% after a two-year holding period; taper relief applies thereafter.

Korpor issues complete fiscal packs for your French filings.`,
  },
  "france-investment-process": {
    id: "france-investment-process",
    title: "How to Invest in France with Korpor",
    updated: "2024-11-29",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `1. Register & KYC on Korpor.
2. Review French offering dossier (legal, technical, market analysis).
3. Subscribe to shares; funds held in escrow by a certified notaire.
4. Closing & notarial act recorded at the cadastre.
5. Receive quarterly income distributions net of French withholding tax.`,
  },
  "france-common-questions": {
    id: "france-common-questions",
    title: "Common Questions: France",
    updated: "2024-12-01",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `**Q: Can I claim French mortgage interest?**
A: Only if you hold a French mortgage—fractional investors do not.

**Q: Is the SCPI structure used?**
A: Korpor uses SPV-based fractional shares, not SCPI vehicles.`,
  },
  "france-faq": {
    id: "france-faq",
    title: "France FAQ",
    updated: "2024-12-03",
    author: { name: "Khalil Zouari", avatar: "Khalil.png" },
    body: `**How do I repatriate proceeds?**
Funds released by notaire; Korpor handles FX conversion.

**What if there's a tenant default?**
Korpor's property manager covers up to three months of lost rent.`,
  },
};

// Helper functions for the help system
export const fetchHelpCollections = async (): Promise<HelpCollection[]> => {
  try {
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    return HELP_COLLECTIONS;
  } catch (error) {
    console.error('Error fetching help collections:', error);
    throw new Error('Failed to fetch help collections');
  }
};

export const fetchHelpArticle = async (articleId: string): Promise<HelpArticle | null> => {
  try {
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 300));
    return HELP_ARTICLES[articleId] || null;
  } catch (error) {
    console.error('Error fetching help article:', error);
    throw new Error('Failed to fetch help article');
  }
};

export const fetchHelpArticlesByCollection = async (collectionId: string): Promise<HelpArticle[]> => {
  try {
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const collection = HELP_COLLECTIONS.find(c => c.id === collectionId);
    if (!collection) {
      return [];
    }

    return collection.articleIds
      .map(articleId => HELP_ARTICLES[articleId])
      .filter(article => article !== undefined);
  } catch (error) {
    console.error('Error fetching help articles by collection:', error);
    throw new Error('Failed to fetch help articles');
  }
};

export const searchHelpArticles = async (query: string): Promise<HelpArticle[]> => {
  try {
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!query.trim()) {
      return [];
    }

    const searchQuery = query.toLowerCase();
    return Object.values(HELP_ARTICLES).filter(article => 
      article.title.toLowerCase().includes(searchQuery) ||
      article.body.toLowerCase().includes(searchQuery)
    );
  } catch (error) {
    console.error('Error searching help articles:', error);
    throw new Error('Failed to search help articles');
  }
};

// Alias for component compatibility
export const fetchArticlesByCollection = fetchHelpArticlesByCollection;
export const fetchArticle = fetchHelpArticle;
