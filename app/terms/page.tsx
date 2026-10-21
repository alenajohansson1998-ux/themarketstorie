
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Terms and Conditions',
  description: 'Terms governing access to The Market Stories website, financial news, market data and tools.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="py-10 lg:py-14">
      <div>
        <div className="site-container px-4 md:px-6">
          <p className="section-label">Legal</p>
          <h1 className="mt-1 mb-8 text-title1 text-ink">Terms & Conditions</h1>

          <div className="article-body">
            <p>
              Welcome to <strong>The Market Stories</strong>. These Terms govern your access to and use of the website, its services, content and tools. By using The Market Stories, you agree to these Terms. If you do not agree, discontinue use of the website.
            </p>
            <p>
              These Terms form an agreement between you and The Market Stories.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing <strong>themarketstories.com</strong>, you confirm that:
            </p>
            <ul>
              <li>You are at least 18 years old or the legal age of majority in your jurisdiction</li>
              <li>You have the legal capacity to enter into this agreement</li>
              <li>You agree to comply with all applicable laws, rules, and regulations</li>
            </ul>
            <p>
              If you are using the Service on behalf of an organization, company, or legal entity, you represent that you are authorized to bind that entity to these Terms.
            </p>

            <h2>2. Scope of Services</h2>
            <p>
              <strong>themarketstories.com</strong> provides news articles, financial insights, market data, stock information, cryptocurrency updates, opinions, analysis, educational content, and related media for informational and educational purposes only.
            </p>
            <p>
              The Service may include:
            </p>
            <ul>
              <li>Global and local news coverage</li>
              <li>Stock market data and charts</li>
              <li>Cryptocurrency market updates</li>
              <li>Commodities and economic indicators</li>
              <li>Editorial opinions and analysis</li>
              <li>User-generated content (where applicable)</li>
            </ul>
            <p>
              We reserve the right to add, modify, suspend, or discontinue any part of the Service at any time without notice.
            </p>

            <h2>3. Use of the Service</h2>
            <p>
              You agree to use TheMarketStories solely for lawful purposes and in a manner consistent with these Terms.
            </p>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use the Service for any illegal, misleading, or fraudulent activity</li>
              <li>Copy, scrape, harvest, or extract data using automated tools without written permission</li>
              <li>Disrupt, damage, or interfere with the website, servers, or networks</li>
              <li>Attempt unauthorized access to restricted areas or systems</li>
              <li>Upload or transmit malware, viruses, or harmful code</li>
              <li>Impersonate another person or entity</li>
              <li>Use the content for commercial purposes without explicit authorization</li>
            </ul>
            <p>
              Violation of these rules may result in suspension or termination of access.
            </p>

            <h2>4. User Accounts and Registration</h2>
            <p>
              Certain features may require account registration. When creating an account, you agree to:
            </p>
            <ul>
              <li>Provide accurate, complete, and current information</li>
              <li>Maintain the confidentiality of your login credentials</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p>
              You must notify us immediately of any unauthorized use or security breach. We are not responsible for losses arising from unauthorized account access due to your failure to secure your credentials.
            </p>

            <h2>5. Content Ownership and Intellectual Property</h2>
            <p>
              All content on <strong>themarketstories.com</strong>, including but not limited to text, articles, graphics, logos, icons, images, videos, software, design elements, and trademarks, is owned by The Market Stories or its licensors and is protected under copyright, trademark, and intellectual property laws.
            </p>
            <p>
              You may:
            </p>
            <ul>
              <li>View and share content for personal, non-commercial use</li>
              <li>Quote limited portions with proper attribution and backlinks</li>
            </ul>
            <p>
              You may not:
            </p>
            <ul>
              <li>Republish or redistribute full articles without permission</li>
              <li>Modify, sell, sublicense, or exploit content commercially</li>
              <li>Use our branding, logos, or trademarks without consent</li>
            </ul>
            <p>
              Unauthorized use may result in legal action.
            </p>

            <h2>6. User-Generated Content</h2>
            <p>
              If <strong>themarketstories.com</strong> allows comments, submissions, or other user-generated content, you retain ownership of your content. However, by submitting content, you grant The Market Stories a worldwide, royalty-free, perpetual license to use, display, modify, distribute, and publish your content in connection with the Service.
            </p>
            <p>
              You agree that your content:
            </p>
            <ul>
              <li>Does not violate any laws or third-party rights</li>
              <li>Is not defamatory, abusive, or misleading</li>
              <li>Does not contain spam or promotional content</li>
            </ul>
            <p>
              We reserve the right to remove or moderate content at our discretion.
            </p>

            <h2>7. Financial and Investment Disclaimer</h2>
            <p>
              All financial, market, stock, crypto, and investment-related information provided on <strong>themarketstories.com</strong> is for general informational purposes only.
            </p>
            <p>
              Nothing on <strong>themarketstories.com</strong> constitutes:
            </p>
            <ul>
              <li>Financial advice</li>
              <li>Investment advice</li>
              <li>Trading advice</li>
              <li>Legal or tax advice</li>
            </ul>
            <p>
              Market data may be delayed, estimated, or sourced from third parties and may not be accurate or complete. You acknowledge that financial markets involve risk and that past performance does not guarantee future results.
            </p>
            <p>
              You are solely responsible for your investment decisions and should consult licensed financial professionals before acting on any information found on <strong>themarketstories.com</strong>.
            </p>

            <h2>8. No Warranties</h2>
            <p>
              The Service is provided as available, without warranties of any kind, whether express or implied.
            </p>
            <p>
              We do not guarantee that:
            </p>
            <ul>
              <li>The Service will be uninterrupted or error-free</li>
              <li>Content will be accurate, complete, or current</li>
              <li>Any defects will be corrected</li>
            </ul>
            <p>
              Your use of the Service is at your own risk.
            </p>

            <h2>9. Third-Party Links and Services</h2>
            <p>
              <strong>themarketstories.com</strong> may contain links to third-party websites, tools, advertisements, or services. These links are provided for convenience only.
            </p>
            <p>
              We do not endorse, control, or assume responsibility for:
            </p>
            <ul>
              <li>Third-party content</li>
              <li>Privacy practices of external websites</li>
              <li>Products or services offered by third parties</li>
            </ul>
            <p>
              You access third-party services at your own risk.
            </p>

            <h2>10. Advertising and Sponsored Content</h2>
            <p>
              TheMarketStories may display advertisements, sponsored articles, affiliate links, or paid content. Sponsored content will be identified where required by law.
            </p>
            <p>
              We are not responsible for claims made by advertisers or third parties. Any interactions or transactions with advertisers are solely between you and the advertiser.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, <strong>themarketstories.com</strong> and its owners shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from:
            </p>
            <ul>
              <li>Use or inability to use the Service</li>
              <li>Errors or inaccuracies in content</li>
              <li>Investment or financial losses</li>
              <li>Unauthorized access or data breaches</li>
            </ul>
            <p>
              Our total liability, if any, shall not exceed the amount you paid to access the Service, if applicable.
            </p>

            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless The Market Stories, its affiliates, employees, partners, and licensors from any claims, damages, losses, liabilities, and expenses arising out of:
            </p>
            <ul>
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your infringement of third-party rights</li>
            </ul>

            <h2>13. Termination and Suspension</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, without notice, if:
            </p>
            <ul>
              <li>You violate these Terms</li>
              <li>Your conduct harms other users or the platform</li>
              <li>Required by law or regulatory authorities</li>
            </ul>
            <p>
              Termination does not waive any rights or remedies available to us.
            </p>

            <h2>14. Privacy Policy</h2>
            <p>
              Your use of <strong>themarketstories.com</strong> is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal data. By using the Service, you consent to our data practices.
            </p>

            <h2>15. Changes to These Terms</h2>
            <p>
              We may update or revise these Terms from time to time. Changes become effective immediately upon posting on this page. Continued use of the Service constitutes acceptance of the updated Terms.
            </p>
            <p>
              We encourage users to review this page regularly.
            </p>

            <h2>16. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and interpreted in accordance with the laws of the jurisdiction in which <strong>themarketstories.com</strong> operates, without regard to conflict of law principles. Any disputes shall be subject to the exclusive jurisdiction of courts located in that jurisdiction.
            </p>

            <h2>17. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>

            <h2>18. Entire Agreement</h2>
            <p>
              These Terms constitute the entire agreement between you and The Market Stories regarding the use of the Service and supersede any prior agreements or understandings.
            </p>

            <h2>19. Contact Information</h2>
            <p>
              If you have any questions, concerns, or requests regarding these Terms & Conditions, you may contact us at:
            </p>
            <p>
              Email: <a href="mailto:Alvensmith1998@gmail.com">Alvensmith1998@gmail.com</a>
            </p>
            <p>
              Website: <a href="https://themarketstories.com" target="_blank" rel="noopener noreferrer">https://themarketstories.com</a>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
