import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const title = 'Contact Us | The Market Stories Support & Partnerships';
  const description = 'Get in touch with The Market Stories for support, advertising, partnerships, or general inquiries. Our team is ready to assist with your questions about financial news, market data, and collaboration opportunities.';
  return {
    title,
    description,
    alternates: {
      canonical: '/contact'
    }
  };
};