import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Subscribe | The Market Stories',
  description: 'Subscribe to The Market Stories for daily financial news, market analysis, and investment insights delivered straight to your inbox.',
  alternates: { canonical: 'https://themarketstories.com/subscription' },
  openGraph: {
    title: 'Subscribe | The Market Stories',
    description: 'Get daily market news and analysis delivered to your inbox.',
    url: 'https://themarketstories.com/subscription',
    siteName: 'The Market Stories',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function SubscriptionPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="site-container px-4 md:px-6 xl:px-8 py-16 max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Stay Ahead of the Market
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Get daily financial news, stock market analysis, and investment insights delivered straight to your inbox — free.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Free Newsletter</h2>
          <p className="text-gray-500 mb-6">
            Join thousands of traders and investors who trust The Market Stories.
          </p>
          <ul className="text-left text-gray-700 space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              Daily market recap & top stories
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              Stock, crypto & commodity analysis
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              Economic calendar highlights
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              Expert opinions & technical breakdowns
            </li>
          </ul>

          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subscribe Free
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">No spam. Unsubscribe anytime.</p>
        </div>

        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
