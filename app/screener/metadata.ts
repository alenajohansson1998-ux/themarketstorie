import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const title = 'Stock Screener | Free Trading & Investing Tool';
  const description = 'Use The Market Stories Stock Screener to filter, analyze, and discover stocks by price, volume, sector, and technical indicators. Ideal for beginners and pros—find your next trade with real-time data and smart filters.';
  return {
    title,
    description,
    alternates: {
      canonical: '/screener'
    }
  };
};
