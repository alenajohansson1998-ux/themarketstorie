import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const title = 'Markets Overview | Live Data & Analysis | The Market Stories';
  const description = 'Get real-time market data, charts, and analysis for stocks, forex, commodities, and indices. The Market Stories Markets page helps you track trends, news, and economic events for smarter investing.';
  return {
    title,
    description,
    alternates: {
      canonical: '/markets'
    }
  };
};
