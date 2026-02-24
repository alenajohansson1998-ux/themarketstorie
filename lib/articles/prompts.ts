import { ArticleType } from "./constants";

type PromptRecord = Record<ArticleType, string>;

const REFERENCE_LINK_REQUIREMENTS = `Reference Link Requirements:
- Add 3 to 6 natural source links from trusted primary sources (official institutions, exchanges, regulators, company filings, major financial publications).
- Use full HTTPS URLs in anchor tags, for example: <a href="https://www.federalreserve.gov/" target="_blank" rel="noopener noreferrer">Federal Reserve</a>.
- Place links contextually in relevant paragraphs, not as random link stuffing.
- Add a final section: "Sources & References" with a bullet list of the same URLs used in the article.
- Never invent or fake URLs. If a reliable source URL is unknown, omit that claim instead of fabricating.`;

const PROMPTS: PromptRecord = {
  global: `You are a senior global financial journalist.

Write a detailed daily Global Market Update.

Cover:
- US stock markets (Dow Jones, S&P 500, Nasdaq)
- European markets
- Asian markets
- Bond yields
- Dollar index movement
- Central bank commentary

Include references to:
Federal Reserve, European Central Bank, Bank of Japan

Structure:
- H1 Title with today's date
- H2 US Markets
- H2 Europe & Asia
- H2 Bond & Currency Movement
- H2 Investor Outlook

Tone:
Professional financial journalism.
Avoid generic AI tone.
Do not fabricate specific numbers unless realistic.
Word count: 900-1200 words.

${REFERENCE_LINK_REQUIREMENTS}`,
  crypto: `You are a professional crypto market analyst.

Write a daily Crypto Market Update.

Cover:
- Bitcoin performance
- Ethereum movement
- Altcoin trends
- ETF flows
- Regulatory developments
- Market sentiment

Structure:
- H1 Title
- H2 Bitcoin Analysis
- H2 Ethereum & Altcoins
- H2 Institutional Activity
- H2 Regulatory News
- H2 Market Outlook

Tone:
Analytical, realistic, investor-focused.
Avoid hype language.
900-1100 words.

${REFERENCE_LINK_REQUIREMENTS}`,
  commodity: `Write a daily Commodity Market Update.

Cover:
- Crude oil price drivers
- OPEC decisions
- Gold movement
- Natural gas trends
- Global supply chain impact

Structure:
- H1 Title
- H2 Oil Market
- H2 Gold Analysis
- H2 Other Commodities
- H2 Geopolitical Impact
- H2 Outlook

Professional tone.
Focus on economic impact.
900-1000 words.

${REFERENCE_LINK_REQUIREMENTS}`,
  business: `Write an analysis article on a major corporate deal impacting financial markets.

Include:
- Overview of the deal
- Market reaction
- Impact on sector
- Investor sentiment
- Long-term implications

Professional business journalism style.
800-1000 words.

${REFERENCE_LINK_REQUIREMENTS}`,
  geopolitical: `Write a geopolitical market impact report.

Focus on:
- International tensions
- Trade agreements
- Sanctions
- Defense or energy agreements

Explain how this affects:
- Stock markets
- Oil prices
- Currencies
- Investor confidence

Structured with H2 sections.
Avoid sensational tone.
Analytical only.

${REFERENCE_LINK_REQUIREMENTS}`,
};

export function getArticlePrompt(type: ArticleType): string {
  return PROMPTS[type];
}

export function getAllArticlePrompts(): PromptRecord {
  return PROMPTS;
}
