export type RadarCategory = 'monetary-policy' | 'economy' | 'earnings' | 'corporate' | 'geopolitics' | 'energy' | 'crypto' | 'technology' | 'regulation' | 'markets';
export type RadarAssetClass = 'Equities' | 'Bonds' | 'Commodities' | 'Currencies' | 'Crypto';

export interface RadarSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
  type: 'official' | 'reporting' | 'editorial';
}

export interface RadarEntity {
  id: string;
  name: string;
  symbol?: string;
  type: 'company' | 'sector' | 'index' | 'commodity' | 'currency' | 'crypto' | 'indicator';
  assetClass: RadarAssetClass;
  description: string;
}

export interface RadarImpact {
  entity: RadarEntity;
  channel: string;
  explanation: string;
  exposure: 'direct' | 'indirect';
  direction: 'mixed' | 'uncertain';
  confidence: 'high' | 'medium';
  evidence: { title: string; url: string; publisher: string }[];
  alternatives: string[];
}

export interface RadarEvent {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: RadarCategory;
  region: string;
  assetClasses: RadarAssetClass[];
  publishedAt: string;
  eventOccurredAt: string | null;
  sources: RadarSource[];
  entities: RadarEntity[];
  impacts: RadarImpact[];
  significance: number;
  evidenceConfidence: number;
  uncertainty: number;
  whyItMatters: string;
  whatToWatch: string[];
  alternativeScenarios: string[];
  evidenceLimitations: string[];
  analysisType: 'rules' | 'ai';
  coverageUrl?: string;
}

export interface RadarFeed {
  events: RadarEvent[];
  asOf: string;
  status: 'ready' | 'degraded' | 'unavailable';
  providers: { name: string; status: 'available' | 'unavailable'; detail?: string }[];
  methodologyVersion: string;
}

export interface RadarQuote {
  symbol: string;
  name: string;
  assetClass: RadarAssetClass;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string;
  timestamp: string | null;
  provider: string;
  sourceUrl: string;
  status: 'delayed' | 'historical' | 'unavailable';
  points: { time: string; value: number }[];
  proxyFor?: string;
  market?: 'India' | 'Global';
  exchange?: string;
  reason?: string;
}

export interface RadarSnapshot {
  quotes: RadarQuote[];
  asOf: string;
  providers?: { name: string; status: 'available' | 'unavailable'; detail?: string }[];
}
