import type { RadarEntity, RadarImpact } from './types';

/** Reviewed educational relationships, not evidence that a particular headline caused a price move. */
export const RELATIONSHIP_REVIEWED_AT = '2026-10-23';
const monetaryEvidence = [{
  title: 'How monetary policy transmits',
  publisher: 'Bank of England',
  url: 'https://www.bankofengland.co.uk/quarterly-bulletin/2024/2024/about-a-rate-of-general-interest-how-monetary-policy-transmits',
}];
const oilPriceEvidence = [{
  title: 'Oil prices and outlook', publisher: 'U.S. Energy Information Administration',
  url: 'https://www.eia.gov/energyexplained/oil-and-petroleum-products/prices-and-outlook.php',
}];
const oilUseEvidence = [{
  title: 'Use of oil', publisher: 'U.S. Energy Information Administration',
  url: 'https://www.eia.gov/energyexplained/oil-and-petroleum-products/use-of-oil.php',
}];

function entity(id: string, name: string, type: RadarEntity['type'], assetClass: RadarEntity['assetClass'], description: string): RadarEntity {
  return { id, name, type, assetClass, description };
}

const bonds = entity('bonds', 'Government bonds', 'sector', 'Bonds', 'Watch duration, yields and the expected path of policy rates.');
const banks = entity('banks', 'Banking', 'sector', 'Equities', 'Deposit costs, lending rates and credit demand can respond differently.');
const currencies = entity('currencies', 'Currencies', 'sector', 'Currencies', 'Relative interest rates are one of several exchange-rate drivers.');
const realEstate = entity('real-estate', 'Real estate', 'sector', 'Equities', 'Borrowing conditions and discount rates influence property finance.');
const crude = entity('crude-oil', 'Crude oil', 'commodity', 'Commodities', 'Supply, inventories, demand and spare capacity influence crude prices.');
const transportation = entity('transport', 'Transportation', 'sector', 'Equities', 'Petroleum fuels are an input for aviation, shipping and road transport.');

function impact(target: RadarEntity, channel: string, explanation: string, evidence: RadarImpact['evidence'], alternatives: string[], exposure: RadarImpact['exposure'] = 'indirect'): RadarImpact {
  return { entity: target, channel, explanation, evidence, alternatives, exposure, direction: 'uncertain', confidence: 'medium' };
}

export function documentedImpacts(title: string): RadarImpact[] {
  const impacts: RadarImpact[] = [];
  const monetary = /\b(?:central bank|federal reserve|fed|fomc|ecb|bank of england|bank of japan|reserve bank|rbi|boe|boj)\b/i.test(title)
    && /\b(?:rates?|monetary|policy|hike|hikes|cut|cuts|tightening|easing)\b/i.test(title);
  if (monetary) {
    impacts.push(
      impact(bonds, 'Policy expectations → bond yields', 'If the report changes the expected policy-rate path, bond yields and valuations may adjust. Duration and existing expectations matter.', monetaryEvidence, ['The announcement may already be priced in.', 'Inflation expectations and term premia may dominate.']),
      impact(banks, 'Funding costs and credit demand', 'Changes in policy rates can affect bank deposit costs, lending income and borrower demand. The net effect differs across banks.', monetaryEvidence, ['Deposit repricing and credit losses can offset lending margins.']),
      impact(currencies, 'Relative interest-rate expectations', 'A change in expected rates relative to other countries may affect exchange rates. A headline alone does not establish the direction.', monetaryEvidence, ['Other central banks may make similar changes.', 'Capital flows and risk sentiment can outweigh rate differentials.']),
      impact(realEstate, 'Financing and discount rates', 'Policy-rate changes can pass through to mortgage costs and property valuations. Fixed-rate debt and local conditions can delay the effect.', monetaryEvidence, ['Local housing supply or fixed-rate mortgages may soften the effect.']),
    );
  }
  if (/\b(?:crude|oil|opec|petroleum|brent)\b/i.test(title)) {
    impacts.push(
      impact(crude, 'Oil supply and demand', 'If the development changes physical supply or demand, crude prices may respond. Inventory levels and spare production capacity can offset a disruption.', oilPriceEvidence, ['Weak demand or alternative supply may offset the development.', 'The headline may concern expectations rather than a physical change.'], 'direct'),
      impact(transportation, 'Petroleum input costs', 'A sustained change in petroleum prices may pass through to transport fuel costs. Hedging, taxes and pricing power affect the eventual margin impact.', oilUseEvidence, ['Fuel hedges or fare adjustments can reduce the effect.', 'Crude and refined-fuel prices may diverge.']),
    );
  }
  return impacts;
}

/** A name in a headline is a mention, never a supplier/competitor relationship. */
const companies: Array<{ name: string; symbol: string; pattern: RegExp }> = [
  { name: 'Apple', symbol: 'AAPL', pattern: /\b(?:apple|aapl)\b/i },
  { name: 'Microsoft', symbol: 'MSFT', pattern: /\b(?:microsoft|msft)\b/i },
  { name: 'NVIDIA', symbol: 'NVDA', pattern: /\b(?:nvidia|nvda)\b/i },
  { name: 'Tesla', symbol: 'TSLA', pattern: /\b(?:tesla|tsla)\b/i },
  { name: 'Amazon', symbol: 'AMZN', pattern: /\b(?:amazon|amzn)\b/i },
  { name: 'Alphabet', symbol: 'GOOGL', pattern: /\b(?:alphabet|google|googl)\b/i },
  { name: 'Meta', symbol: 'META', pattern: /\b(?:meta platforms|facebook)\b/i },
  { name: 'Oracle', symbol: 'ORCL', pattern: /\b(?:oracle|orcl)\b/i },
  { name: 'AMD', symbol: 'AMD', pattern: /\b(?:amd|advanced micro devices)\b/i },
  { name: 'TSMC', symbol: 'TSM', pattern: /\b(?:tsmc|taiwan semiconductor)\b/i },
];

export function mentionedEntities(title: string): RadarEntity[] {
  const output: RadarEntity[] = companies.filter(company => company.pattern.test(title)).map(company => ({
    id: company.symbol.toLowerCase(), name: company.name, symbol: company.symbol,
    type: 'company', assetClass: 'Equities', description: 'Named in the source headline; this mention does not establish a business relationship or a price effect.',
  }));
  if (/\bbitcoin\b|\bbtc\b/i.test(title)) output.push({ ...entity('bitcoin', 'Bitcoin', 'crypto', 'Crypto', 'Named in the source headline.'), symbol: 'BTC' });
  if (/\bethereum\b|\bether\b/i.test(title)) output.push({ ...entity('ethereum', 'Ethereum', 'crypto', 'Crypto', 'Named in the source headline.'), symbol: 'ETH' });
  return output;
}
