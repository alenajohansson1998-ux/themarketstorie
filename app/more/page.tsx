import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const title = 'More | Explore Extra Features | The Market Stories';
  const description = 'Discover more features, updates, and exclusive content on The Market Stories. Stay tuned for new tools, resources, and announcements to help you stay ahead in the financial markets.';
  return {
    title,
    description,
    alternates: {
      canonical: '/more'
    }
  };
};
export default function MorePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">More</h1>
      <p>Welcome to the More page. Content coming soon.</p>
    </main>
  );
}