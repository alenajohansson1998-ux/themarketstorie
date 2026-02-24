
import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const title = 'About NewsDay | Trusted Financial News & Market Insights';
  const description = 'Learn about NewsDay’s mission to deliver accurate, timely financial news, expert analysis, and educational content for investors and professionals. Discover our values and commitment to empowering your financial journey.';
  return {
    title,
    description,
    alternates: {
      canonical: '/about'
    }
  };
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About NewsDay</h1>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                NewsDay is dedicated to delivering comprehensive, accurate, and timely financial news and market insights to empower investors, traders, and financial professionals worldwide. We strive to be the most trusted source for market intelligence, combining cutting-edge technology with expert analysis.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800 font-medium">
                  "Empowering investors with knowledge, transparency, and innovation since 2020."
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span>Provide real-time financial market data and analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span>Deliver breaking news from global financial markets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span>Offer expert opinions and market insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span>Publish educational content for investors</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span>Maintain comprehensive market data archives</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">🎯</span>
                    <span><strong>Accuracy:</strong> Commitment to factual reporting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">⚡</span>
                    <span><strong>Speed:</strong> Fast delivery of breaking news</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">🔍</span>
                    <span><strong>Transparency:</strong> Clear disclosure of sources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">🛡️</span>
                    <span><strong>Integrity:</strong> Ethical journalism standards</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">🌍</span>
                    <span><strong>Global Perspective:</strong> Worldwide market coverage</span>
                  </li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our History</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">2020</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Foundation</h3>
                    <p className="text-gray-600">NewsDay was founded with a vision to revolutionize financial news delivery through technology and expert analysis.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">2021</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Expansion</h3>
                    <p className="text-gray-600">Launched comprehensive market data services and expanded our global news network to cover emerging markets.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">2022</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Innovation</h3>
                    <p className="text-gray-600">Introduced AI-powered market analysis tools and enhanced our mobile platform for better user experience.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">2023</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Growth</h3>
                    <p className="text-gray-600">Achieved significant user growth and expanded our content offerings to include cryptocurrency and commodities markets.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">2024</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Present Day</h3>
                    <p className="text-gray-600">Continuing to innovate with advanced analytics, personalized content, and comprehensive market coverage.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1M+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">500K+</div>
                <div className="text-gray-600">Daily Articles</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-gray-600">Countries Covered</div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Team</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <p className="text-gray-600 mb-6">
                NewsDay is powered by a diverse team of experienced journalists, financial analysts, data scientists, and technology experts. Our editorial team includes former Wall Street professionals and seasoned financial reporters from leading publications.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">👨‍💼</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Editorial Team</h3>
                  <p className="text-sm text-gray-600">Experienced financial journalists</p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Analysts</h3>
                  <p className="text-sm text-gray-600">Market experts and researchers</p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">💻</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Technology</h3>
                  <p className="text-sm text-gray-600">Data scientists and engineers</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Technology</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <p className="text-gray-600 mb-6">
                We leverage cutting-edge technology to deliver real-time market data, personalized content, and advanced analytics. Our platform is built with modern web technologies and powered by robust data infrastructure.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-medium text-gray-900">Real-time Data</div>
                  <div className="text-sm text-gray-600">Live market updates</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="font-medium text-gray-900">AI Analysis</div>
                  <div className="text-sm text-gray-600">Smart insights</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="font-medium text-gray-900">Mobile First</div>
                  <div className="text-sm text-gray-600">Responsive design</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="font-medium text-gray-900">Secure</div>
                  <div className="text-sm text-gray-600">Enterprise security</div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Awards & Recognition</h2>
            <div className="bg-linear-to-r from-blue-50 to-purple-50 p-6 rounded-lg shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Industry Awards</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>🏆 Best Financial News Platform 2023</li>
                    <li>⭐ Innovation in Financial Journalism 2022</li>
                    <li>🎯 Most Trusted Market Data Provider 2021</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Community Recognition</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>👥 Top Rated by Financial Professionals</li>
                    <li>📈 Growing User Base Recognition</li>
                    <li>🌟 Excellence in User Experience</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Community</h2>
              <p className="text-gray-600 mb-4">
                Become part of the NewsDay community. Follow us on social media, subscribe to our newsletter, and engage with fellow investors and market enthusiasts.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Follow on Twitter
                </a>
                <a href="#" className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors">
                  Like on Facebook
                </a>
                <a href="#" className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                  Follow on Instagram
                </a>
                <a href="#" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Subscribe on YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
