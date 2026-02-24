import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const title = 'Forex & Market Tools | The Market Stories';
  const description = 'Explore The Market Stories’ suite of free financial tools, including a live Forex Heatmap and more. Analyze markets, track trends, and make smarter trading decisions with our powerful, easy-to-use resources.';
  return {
    title,
    description,
    alternates: {
      canonical: '/tools'
    }
  };
};
