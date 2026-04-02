export interface WorldMarketConfigEntry {
  label: string;
  location: [number, number];
  polygonTickers: string[];
  finnhubSymbols: string[];
}

export const WORLD_MARKET_CONFIG = {
  US: {
    label: "United States",
    location: [40.7128, -74.006],
    polygonTickers: ["I:SPX", "I:GSPC"],
    finnhubSymbols: ["SPY", "VOO"],
  },
  CA: {
    label: "Canada",
    location: [43.6532, -79.3832],
    polygonTickers: ["I:SPTSX", "I:GSPTSE"],
    finnhubSymbols: ["EWC"],
  },
  BR: {
    label: "Brazil",
    location: [-23.5505, -46.6333],
    polygonTickers: ["I:IBOV", "I:BVSP"],
    finnhubSymbols: ["EWZ"],
  },
  MX: {
    label: "Mexico",
    location: [19.4326, -99.1332],
    polygonTickers: ["I:MXX"],
    finnhubSymbols: ["EWW"],
  },
  AR: {
    label: "Argentina",
    location: [-34.6037, -58.3816],
    polygonTickers: [],
    finnhubSymbols: ["ARGT"],
  },
  CL: {
    label: "Chile",
    location: [-33.4489, -70.6693],
    polygonTickers: [],
    finnhubSymbols: ["ECH"],
  },
  PE: {
    label: "Peru",
    location: [-12.0464, -77.0428],
    polygonTickers: [],
    finnhubSymbols: ["EPU"],
  },
  CO: {
    label: "Colombia",
    location: [4.711, -74.0721],
    polygonTickers: [],
    finnhubSymbols: ["GXG"],
  },
  GB: {
    label: "United Kingdom",
    location: [51.5072, -0.1276],
    polygonTickers: ["I:UKX", "I:FTSE"],
    finnhubSymbols: ["EWU"],
  },
  DE: {
    label: "Germany",
    location: [50.1109, 8.6821],
    polygonTickers: ["I:DAX", "I:GDAXI"],
    finnhubSymbols: ["EWG"],
  },
  FR: {
    label: "France",
    location: [48.8566, 2.3522],
    polygonTickers: ["I:CAC", "I:FCHI"],
    finnhubSymbols: ["EWQ"],
  },
  IT: {
    label: "Italy",
    location: [45.4642, 9.19],
    polygonTickers: [],
    finnhubSymbols: ["EWI"],
  },
  ES: {
    label: "Spain",
    location: [40.4168, -3.7038],
    polygonTickers: [],
    finnhubSymbols: ["EWP"],
  },
  CH: {
    label: "Switzerland",
    location: [47.3769, 8.5417],
    polygonTickers: [],
    finnhubSymbols: ["EWL"],
  },
  NL: {
    label: "Netherlands",
    location: [52.3676, 4.9041],
    polygonTickers: [],
    finnhubSymbols: ["EWN"],
  },
  BE: {
    label: "Belgium",
    location: [50.8503, 4.3517],
    polygonTickers: [],
    finnhubSymbols: ["EWK"],
  },
  AT: {
    label: "Austria",
    location: [48.2082, 16.3738],
    polygonTickers: [],
    finnhubSymbols: ["EWO"],
  },
  SE: {
    label: "Sweden",
    location: [59.3293, 18.0686],
    polygonTickers: [],
    finnhubSymbols: ["EWD"],
  },
  FI: {
    label: "Finland",
    location: [60.1699, 24.9384],
    polygonTickers: [],
    finnhubSymbols: ["EFNL"],
  },
  DK: {
    label: "Denmark",
    location: [55.6761, 12.5683],
    polygonTickers: [],
    finnhubSymbols: ["EDEN"],
  },
  IE: {
    label: "Ireland",
    location: [53.3498, -6.2603],
    polygonTickers: [],
    finnhubSymbols: ["EIRL"],
  },
  PL: {
    label: "Poland",
    location: [52.2297, 21.0122],
    polygonTickers: [],
    finnhubSymbols: ["EPOL"],
  },
  GR: {
    label: "Greece",
    location: [37.9838, 23.7275],
    polygonTickers: [],
    finnhubSymbols: ["GREK"],
  },
  PT: {
    label: "Portugal",
    location: [38.7223, -9.1393],
    polygonTickers: [],
    finnhubSymbols: ["PGAL"],
  },
  TR: {
    label: "Turkey",
    location: [41.0082, 28.9784],
    polygonTickers: [],
    finnhubSymbols: ["TUR"],
  },
  JP: {
    label: "Japan",
    location: [35.6762, 139.6503],
    polygonTickers: ["I:N225", "I:NKY"],
    finnhubSymbols: ["EWJ"],
  },
  CN: {
    label: "China",
    location: [31.2304, 121.4737],
    polygonTickers: ["I:000001", "I:SSEC"],
    finnhubSymbols: ["MCHI", "FXI"],
  },
  IN: {
    label: "India",
    location: [19.076, 72.8777],
    polygonTickers: ["I:SENSEX", "I:BSESN"],
    finnhubSymbols: ["INDA", "EPI"],
  },
  AU: {
    label: "Australia",
    location: [-33.8688, 151.2093],
    polygonTickers: ["I:XJO", "I:AXJO"],
    finnhubSymbols: ["EWA"],
  },
  KR: {
    label: "South Korea",
    location: [37.5665, 126.978],
    polygonTickers: ["I:KOSPI", "I:KS11"],
    finnhubSymbols: ["EWY"],
  },
  TW: {
    label: "Taiwan",
    location: [25.033, 121.5654],
    polygonTickers: [],
    finnhubSymbols: ["EWT"],
  },
  HK: {
    label: "Hong Kong",
    location: [22.3193, 114.1694],
    polygonTickers: [],
    finnhubSymbols: ["EWH"],
  },
  SG: {
    label: "Singapore",
    location: [1.3521, 103.8198],
    polygonTickers: [],
    finnhubSymbols: ["EWS"],
  },
  MY: {
    label: "Malaysia",
    location: [3.139, 101.6869],
    polygonTickers: [],
    finnhubSymbols: ["EWM"],
  },
  TH: {
    label: "Thailand",
    location: [13.7563, 100.5018],
    polygonTickers: [],
    finnhubSymbols: ["THD"],
  },
  ID: {
    label: "Indonesia",
    location: [-6.2088, 106.8456],
    polygonTickers: [],
    finnhubSymbols: ["IDX"],
  },
  PH: {
    label: "Philippines",
    location: [14.5995, 120.9842],
    polygonTickers: [],
    finnhubSymbols: ["EPHE"],
  },
  VN: {
    label: "Vietnam",
    location: [10.8231, 106.6297],
    polygonTickers: [],
    finnhubSymbols: ["VNM"],
  },
  PK: {
    label: "Pakistan",
    location: [24.8607, 67.0011],
    polygonTickers: [],
    finnhubSymbols: ["PAK"],
  },
  NZ: {
    label: "New Zealand",
    location: [-36.8509, 174.7645],
    polygonTickers: [],
    finnhubSymbols: ["ENZL"],
  },
  IL: {
    label: "Israel",
    location: [32.0853, 34.7818],
    polygonTickers: [],
    finnhubSymbols: ["EIS"],
  },
  SA: {
    label: "Saudi Arabia",
    location: [24.7136, 46.6753],
    polygonTickers: [],
    finnhubSymbols: ["KSA"],
  },
  AE: {
    label: "United Arab Emirates",
    location: [25.2048, 55.2708],
    polygonTickers: [],
    finnhubSymbols: ["UAE"],
  },
  QA: {
    label: "Qatar",
    location: [25.2854, 51.531],
    polygonTickers: [],
    finnhubSymbols: ["QAT"],
  },
  KW: {
    label: "Kuwait",
    location: [29.3759, 47.9774],
    polygonTickers: [],
    finnhubSymbols: ["KWT"],
  },
  ZA: {
    label: "South Africa",
    location: [-26.2041, 28.0473],
    polygonTickers: [],
    finnhubSymbols: ["EZA"],
  },
  EG: {
    label: "Egypt",
    location: [30.0444, 31.2357],
    polygonTickers: [],
    finnhubSymbols: ["EGPT"],
  },
} satisfies Record<string, WorldMarketConfigEntry>;

export type MarketCountryCode = keyof typeof WORLD_MARKET_CONFIG;

export const DIRECT_COUNTRY_CODES = Object.keys(WORLD_MARKET_CONFIG) as MarketCountryCode[];
