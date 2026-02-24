export interface ForexPair {
  symbol: string
  price: number
  change: number
  changePercent: number
}

export const forexAPI = {
  getMajorPairs: async (): Promise<ForexPair[]> => {
    // Note: This is using mock data since free forex APIs are limited
    // For production, consider using a paid API like Alpha Vantage or Forex API
    const mockData: ForexPair[] = [
      { symbol: 'EUR/USD', price: 1.0845, change: 0.0021, changePercent: 0.19 },
      { symbol: 'GBP/USD', price: 1.2723, change: -0.0045, changePercent: -0.35 },
      { symbol: 'USD/JPY', price: 157.84, change: 0.12, changePercent: 0.08 },
      { symbol: 'USD/CHF', price: 0.9042, change: -0.0012, changePercent: -0.13 },
      { symbol: 'AUD/USD', price: 0.6589, change: 0.0034, changePercent: 0.52 },
      { symbol: 'USD/CAD', price: 1.3567, change: -0.0023, changePercent: -0.17 },
    ]
    return mockData
  },
}
