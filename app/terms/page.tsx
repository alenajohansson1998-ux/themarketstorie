
import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const title = 'Terms & Conditions | The Market Stories User Agreement';
  const description = 'Review the Terms & Conditions for using The Market Stories. Understand your rights, responsibilities, and the rules governing access to our financial news, market data, and educational content platform.';
  return {
    title,
    description,
    alternates: {
      canonical: '/terms'
    }
  };
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to <strong>The Market Stories</strong> ("themarketstories.com"). These Terms & Conditions ("Terms", "Agreement") govern your access to and use of the The Market Stories website, mobile applications, and all related services, features, content, and tools (collectively, the "Service"). By accessing, browsing, or using The Market Stories in any manner, you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you do not agree to these Terms, you must discontinue use of the Service immediately.
            </p>
            <p className="text-gray-600 mb-6">
              These Terms form a legally binding agreement between you ("User", "you", "your") and The Market Stories ("we", "our", "us").
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing <strong>themarketstories.com</strong>, you confirm that:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>You are at least 18 years old or the legal age of majority in your jurisdiction</li>
              <li>You have the legal capacity to enter into this agreement</li>
              <li>You agree to comply with all applicable laws, rules, and regulations</li>
            </ul>
            <p className="text-gray-600 mb-4">
              If you are using the Service on behalf of an organization, company, or legal entity, you represent that you are authorized to bind that entity to these Terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Scope of Services</h2>
            <p className="text-gray-600 mb-4">
              <strong>themarketstories.com</strong> provides news articles, financial insights, market data, stock information, cryptocurrency updates, opinions, analysis, educational content, and related media for informational and educational purposes only.
            </p>
            <p className="text-gray-600 mb-4">
              The Service may include:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Global and local news coverage</li>
              <li>Stock market data and charts</li>
              <li>Cryptocurrency market updates</li>
              <li>Commodities and economic indicators</li>
              <li>Editorial opinions and analysis</li>
              <li>User-generated content (where applicable)</li>
            </ul>
            <p className="text-gray-600 mb-4">
              We reserve the right to add, modify, suspend, or discontinue any part of the Service at any time without notice.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Use of the Service</h2>
            <p className="text-gray-600 mb-4">
              You agree to use NewsDay solely for lawful purposes and in a manner consistent with these Terms.
            </p>
            <p className="text-gray-600 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Use the Service for any illegal, misleading, or fraudulent activity</li>
              <li>Copy, scrape, harvest, or extract data using automated tools without written permission</li>
              <li>Disrupt, damage, or interfere with the website, servers, or networks</li>
              <li>Attempt unauthorized access to restricted areas or systems</li>
              <li>Upload or transmit malware, viruses, or harmful code</li>
              <li>Impersonate another person or entity</li>
              <li>Use the content for commercial purposes without explicit authorization</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Violation of these rules may result in suspension or termination of access.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. User Accounts and Registration</h2>
            <p className="text-gray-600 mb-4">
              Certain features may require account registration. When creating an account, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Provide accurate, complete, and current information</li>
              <li>Maintain the confidentiality of your login credentials</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="text-gray-600 mb-4">
              You must notify us immediately of any unauthorized use or security breach. We are not responsible for losses arising from unauthorized account access due to your failure to secure your credentials.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Content Ownership and Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              All content on <strong>themarketstories.com</strong>, including but not limited to text, articles, graphics, logos, icons, images, videos, software, design elements, and trademarks, is owned by The Market Stories or its licensors and is protected under copyright, trademark, and intellectual property laws.
            </p>
            <p className="text-gray-600 mb-4">
              You may:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>View and share content for personal, non-commercial use</li>
              <li>Quote limited portions with proper attribution and backlinks</li>
            </ul>
            <p className="text-gray-600 mb-4">
              You may not:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Republish or redistribute full articles without permission</li>
              <li>Modify, sell, sublicense, or exploit content commercially</li>
              <li>Use our branding, logos, or trademarks without consent</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Unauthorized use may result in legal action.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. User-Generated Content</h2>
            <p className="text-gray-600 mb-4">
              If <strong>themarketstories.com</strong> allows comments, submissions, or other user-generated content, you retain ownership of your content. However, by submitting content, you grant The Market Stories a worldwide, royalty-free, perpetual license to use, display, modify, distribute, and publish your content in connection with the Service.
            </p>
            <p className="text-gray-600 mb-4">
              You agree that your content:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Does not violate any laws or third-party rights</li>
              <li>Is not defamatory, abusive, or misleading</li>
              <li>Does not contain spam or promotional content</li>
            </ul>
            <p className="text-gray-600 mb-4">
              We reserve the right to remove or moderate content at our discretion.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Financial and Investment Disclaimer</h2>
            <p className="text-gray-600 mb-4">
              All financial, market, stock, crypto, and investment-related information provided on <strong>themarketstories.com</strong> is for general informational purposes only.
            </p>
            <p className="text-gray-600 mb-4">
              Nothing on <strong>themarketstories.com</strong> constitutes:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Financial advice</li>
              <li>Investment advice</li>
              <li>Trading advice</li>
              <li>Legal or tax advice</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Market data may be delayed, estimated, or sourced from third parties and may not be accurate or complete. You acknowledge that financial markets involve risk and that past performance does not guarantee future results.
            </p>
            <p className="text-gray-600 mb-4">
              You are solely responsible for your investment decisions and should consult licensed financial professionals before acting on any information found on <strong>themarketstories.com</strong>.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. No Warranties</h2>
            <p className="text-gray-600 mb-4">
              The Service is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied.
            </p>
            <p className="text-gray-600 mb-4">
              We do not guarantee that:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>The Service will be uninterrupted or error-free</li>
              <li>Content will be accurate, complete, or current</li>
              <li>Any defects will be corrected</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Your use of the Service is at your own risk.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Third-Party Links and Services</h2>
            <p className="text-gray-600 mb-4">
              <strong>themarketstories.com</strong> may contain links to third-party websites, tools, advertisements, or services. These links are provided for convenience only.
            </p>
            <p className="text-gray-600 mb-4">
              We do not endorse, control, or assume responsibility for:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Third-party content</li>
              <li>Privacy practices of external websites</li>
              <li>Products or services offered by third parties</li>
            </ul>
            <p className="text-gray-600 mb-4">
              You access third-party services at your own risk.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Advertising and Sponsored Content</h2>
            <p className="text-gray-600 mb-4">
              NewsDay may display advertisements, sponsored articles, affiliate links, or paid content. Sponsored content will be identified where required by law.
            </p>
            <p className="text-gray-600 mb-4">
              We are not responsible for claims made by advertisers or third parties. Any interactions or transactions with advertisers are solely between you and the advertiser.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              To the fullest extent permitted by law, <strong>themarketstories.com</strong> and its owners shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Use or inability to use the Service</li>
              <li>Errors or inaccuracies in content</li>
              <li>Investment or financial losses</li>
              <li>Unauthorized access or data breaches</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Our total liability, if any, shall not exceed the amount you paid to access the Service, if applicable.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Indemnification</h2>
            <p className="text-gray-600 mb-4">
              You agree to indemnify, defend, and hold harmless The Market Stories, its affiliates, employees, partners, and licensors from any claims, damages, losses, liabilities, and expenses arising out of:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your infringement of third-party rights</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Termination and Suspension</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to suspend or terminate your access to the Service at any time, without notice, if:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>You violate these Terms</li>
              <li>Your conduct harms other users or the platform</li>
              <li>Required by law or regulatory authorities</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Termination does not waive any rights or remedies available to us.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Privacy Policy</h2>
            <p className="text-gray-600 mb-4">
              Your use of <strong>themarketstories.com</strong> is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal data. By using the Service, you consent to our data practices.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Changes to These Terms</h2>
            <p className="text-gray-600 mb-4">
              We may update or revise these Terms from time to time. Changes become effective immediately upon posting on this page. Continued use of the Service constitutes acceptance of the updated Terms.
            </p>
            <p className="text-gray-600 mb-4">
              We encourage users to review this page regularly.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">16. Governing Law and Jurisdiction</h2>
            <p className="text-gray-600 mb-4">
              These Terms shall be governed by and interpreted in accordance with the laws of the jurisdiction in which <strong>themarketstories.com</strong> operates, without regard to conflict of law principles. Any disputes shall be subject to the exclusive jurisdiction of courts located in that jurisdiction.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">17. Severability</h2>
            <p className="text-gray-600 mb-4">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">18. Entire Agreement</h2>
            <p className="text-gray-600 mb-4">
              These Terms constitute the entire agreement between you and The Market Stories regarding the use of the Service and supersede any prior agreements or understandings.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">19. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions, concerns, or requests regarding these Terms & Conditions, you may contact us at:
            </p>
            <p className="text-gray-600 mb-4">
              Email: <a href="mailto:support@themarketstories.com">support@themarketstories.com</a>
            </p>
            <p className="text-gray-600 mb-4">
              Website: <a href="https://themarketstories.com" target="_blank" rel="noopener noreferrer">https://themarketstories.com</a>
            </p>

            <p className="text-gray-600 mt-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
import Header from '../../components/Header';
