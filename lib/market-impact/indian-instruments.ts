/** Browser-safe public identifiers. Credentials and requests belong in groww.ts. */
export interface GrowwInstrument {
  symbol: string;
  name: string;
  exchange: 'NSE';
  currency: 'INR' | 'PTS';
  tradingSymbol: string;
  growwSymbol: string;
  sourceUrl: string;
}

const SOURCE_URL = 'https://groww.in/trade-api/docs/curl/live-data#get-quote';

export const GROWW_INSTRUMENTS: readonly GrowwInstrument[] = [
  { symbol: 'NSE:NIFTY', name: 'Nifty 50', exchange: 'NSE', currency: 'PTS', tradingSymbol: 'NIFTY', growwSymbol: 'NSE-NIFTY', sourceUrl: SOURCE_URL },
  { symbol: 'NSE:BANKNIFTY', name: 'Nifty Bank', exchange: 'NSE', currency: 'PTS', tradingSymbol: 'BANKNIFTY', growwSymbol: 'NSE-BANKNIFTY', sourceUrl: SOURCE_URL },
  { symbol: 'NSE:RELIANCE', name: 'Reliance Industries', exchange: 'NSE', currency: 'INR', tradingSymbol: 'RELIANCE', growwSymbol: 'NSE-RELIANCE', sourceUrl: SOURCE_URL },
  { symbol: 'NSE:TCS', name: 'Tata Consultancy Services', exchange: 'NSE', currency: 'INR', tradingSymbol: 'TCS', growwSymbol: 'NSE-TCS', sourceUrl: SOURCE_URL },
  { symbol: 'NSE:INFY', name: 'Infosys', exchange: 'NSE', currency: 'INR', tradingSymbol: 'INFY', growwSymbol: 'NSE-INFY', sourceUrl: SOURCE_URL },
  { symbol: 'NSE:HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', currency: 'INR', tradingSymbol: 'HDFCBANK', growwSymbol: 'NSE-HDFCBANK', sourceUrl: SOURCE_URL },
];

export function getGrowwInstrument(symbol: string): GrowwInstrument | undefined {
  return GROWW_INSTRUMENTS.find((instrument) => instrument.symbol === symbol);
}
