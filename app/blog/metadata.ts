import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const title = 'Blog | Latest Financial News & Insights | The Market Stories';
  const description = 'Read the latest financial news, expert analysis, and market insights on The Market Stories Blog. Stay informed with trending topics, investment tips, and in-depth articles for traders and investors.';
  return {
    title,
    description,
    alternates: {
      canonical: '/blog'
    }
  };
};
