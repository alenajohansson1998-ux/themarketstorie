
import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const title = 'Privacy Policy | The Market Stories Data Protection & Security';
  const description = 'Read The Market Stories Privacy Policy to learn how we collect, use, and protect your personal information. We are committed to transparency, data security, and respecting your privacy as you use our financial news platform.';
  return {
    title,
    description,
    alternates: {
      canonical: '/privacy'
    }
  };
};


export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to The Market Stories. This Privacy Policy ("Policy") explains how The Market Stories ("we", "our", "us") collects, uses, discloses, and safeguards your information when you visit our website, use our services, or interact with our content. By accessing or using The Market Stories, you agree to the collection and use of information in accordance with this Policy.
            </p>
            <p className="text-gray-600 mb-6">
              This Policy applies to all users of the themarketstories.com website, mobile applications, and related services (collectively, the "Service").
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.1 Information You Provide Directly</h3>
            <p className="text-gray-600 mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Account registration information (name, email address, username, password)</li>
              <li>Profile information and preferences</li>
              <li>Communications you send to us (emails, support requests, feedback)</li>
              <li>Content you submit (comments, articles, user-generated content)</li>
              <li>Survey responses and contest entries</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.2 Information Collected Automatically</h3>
            <p className="text-gray-600 mb-4">
              When you use our Service, we automatically collect certain information, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Device information (IP address, browser type, operating system, device identifiers)</li>
              <li>Usage data (pages visited, time spent, click patterns, search queries)</li>
              <li>Location information (general geographic location based on IP address)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Log data (access times, referring URLs, browser type)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.3 Information from Third Parties</h3>
            <p className="text-gray-600 mb-4">
              We may receive information about you from third-party sources, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Social media platforms (if you log in using social accounts)</li>
              <li>Analytics providers</li>
              <li>Advertising networks</li>
              <li>Business partners and affiliates</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Providing, maintaining, and improving our Service</li>
              <li>Creating and managing your account</li>
              <li>Personalizing your experience and content recommendations</li>
              <li>Communicating with you about our Service, updates, and promotions</li>
              <li>Responding to your comments, questions, and customer service requests</li>
              <li>Analyzing usage patterns and trends to improve our Service</li>
              <li>Detecting, preventing, and addressing technical issues or security threats</li>
              <li>Complying with legal obligations and enforcing our Terms & Conditions</li>
              <li>Conducting research and analytics to enhance user experience</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Cookies and Tracking Technologies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies, web beacons, pixels, and similar technologies to collect information and enhance your experience on our Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Types of Cookies We Use</h3>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Managing Cookies</h3>
            <p className="text-gray-600 mb-4">
              You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our Service. You can also opt out of interest-based advertising through your device settings or industry opt-out tools.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 With Your Consent</h3>
            <p className="text-gray-600 mb-4">
              We share information when you explicitly consent to such sharing.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Service Providers</h3>
            <p className="text-gray-600 mb-4">
              We share information with trusted third-party service providers who assist us in operating our Service, such as hosting providers, analytics services, and customer support platforms. These providers are contractually obligated to protect your information.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 Legal Requirements</h3>
            <p className="text-gray-600 mb-4">
              We may disclose information if required by law, court order, or government request, or to protect our rights, property, or safety, or that of our users or the public.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.4 Business Transfers</h3>
            <p className="text-gray-600 mb-4">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.5 Aggregated or Anonymized Data</h3>
            <p className="text-gray-600 mb-4">
              We may share aggregated or anonymized data that cannot be used to identify individual users for analytical, research, or business purposes.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication procedures</li>
              <li>Secure data storage and processing practices</li>
            </ul>
            <p className="text-gray-600 mb-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Policy, unless a longer retention period is required or permitted by law. Factors influencing retention include:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>The nature of the information and how it is used</li>
              <li>Legal, regulatory, tax, or accounting requirements</li>
              <li>Resolution of disputes and enforcement of agreements</li>
              <li>Legitimate business needs</li>
            </ul>
            <p className="text-gray-600 mb-4">
              When information is no longer needed, we securely delete or anonymize it.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-600 mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal limitations)</li>
              <li><strong>Portability:</strong> Request transfer of your data in a structured format</li>
              <li><strong>Opt-out:</strong> Opt out of marketing communications or certain data processing</li>
              <li><strong>Restriction:</strong> Request limitation of how we process your information</li>
            </ul>
            <p className="text-gray-600 mb-4">
              To exercise these rights, please contact us using the information provided below. We will respond to your request within a reasonable timeframe and in accordance with applicable laws.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our Service is not intended for children under 13 years of age (or the minimum age in your jurisdiction). We do not knowingly collect personal information from children under this age. If we become aware that we have collected personal information from a child under the applicable age, we will take steps to delete such information promptly.
            </p>
            <p className="text-gray-600 mb-4">
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-600 mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards, such as standard contractual clauses or adequacy decisions.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Third-Party Websites and Services</h2>
            <p className="text-gray-600 mb-4">
              Our Service may contain links to third-party websites, applications, or services. This Policy does not apply to these external services. We encourage you to review the privacy policies of any third-party services you use.
            </p>
            <p className="text-gray-600 mb-4">
              We are not responsible for the privacy practices or content of third-party services.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will notify you by:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Posting the updated Policy on this page</li>
              <li>Sending you an email notification (if applicable)</li>
              <li>Displaying a prominent notice on our Service</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Your continued use of the Service after the effective date of changes constitutes acceptance of the updated Policy. We encourage you to review this Policy periodically.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="text-gray-600 mb-4">
              Email: privacy@themarketstories.com<br />
              Address: [Your Business Address]<br />
              Phone: [Your Phone Number]
            </p>
            <p className="text-gray-600 mb-4">
              We will respond to your inquiries within a reasonable timeframe.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Data Protection Officer</h2>
            <p className="text-gray-600 mb-4">
              For matters related to data protection and privacy, you can contact our Data Protection Officer at dpo@themarketstories.com.
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
