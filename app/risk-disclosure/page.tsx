
import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const title = 'Risk Disclosure | The Market Stories Investment Risks';
  const description = 'Understand the risks of investing and trading with The Market Stories. Read our Risk Disclosure to learn about market volatility, leverage, and the importance of informed financial decisions.';
  return {
    title,
    description,
    alternates: {
      canonical: '/risk-disclosure'
    }
  };
};

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Risk Disclosure</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>IMPORTANT RISK DISCLOSURE:</strong> Before using The Market Stories or any of its services, please read this Risk Disclosure carefully. Financial markets and investment activities involve substantial risk of loss and are not suitable for every investor. By accessing The Market Stories, you acknowledge that you understand and accept these risks.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. General Risk Warning</h2>
            <p className="text-gray-600 mb-4">
              Trading and investing in financial markets, including stocks, bonds, commodities, currencies, cryptocurrencies, and other instruments, involves significant risk. You may lose some or all of your invested capital. Historical performance does not guarantee future results.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>The Market Stories does not provide investment advice, recommendations, or solicitations to buy or sell any financial instruments.</strong> All content on The Market Stories is for informational and educational purposes only.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Market Risks</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Volatility Risk</h3>
            <p className="text-gray-600 mb-4">
              Financial markets can be highly volatile. Prices can change rapidly and unpredictably due to various factors including economic conditions, political events, natural disasters, and market sentiment. Extreme price movements can occur without warning.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Liquidity Risk</h3>
            <p className="text-gray-600 mb-4">
              Some investments may be difficult to sell quickly at a fair price, especially during market stress or for less commonly traded instruments. You may not be able to exit positions when desired or may have to accept significantly lower prices.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.3 Market Risk</h3>
            <p className="text-gray-600 mb-4">
              The value of investments can fall as well as rise. Market downturns can be severe and prolonged. Past performance is not indicative of future results.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Cryptocurrency and Digital Asset Risks</h2>
            <p className="text-gray-600 mb-4">
              Cryptocurrencies and digital assets are subject to additional risks:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li><strong>Regulatory Risk:</strong> Cryptocurrency regulations vary by jurisdiction and can change rapidly</li>
              <li><strong>Security Risk:</strong> Digital wallets and exchanges can be hacked or compromised</li>
              <li><strong>Technology Risk:</strong> Blockchain technology is relatively new and may have undiscovered vulnerabilities</li>
              <li><strong>Counterparty Risk:</strong> Exchanges and custodians may fail or become insolvent</li>
              <li><strong>Volatility:</strong> Cryptocurrency prices can experience extreme fluctuations</li>
              <li><strong>Lack of Insurance:</strong> Most digital assets are not insured against loss</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Leverage and Derivatives Risks</h2>
            <p className="text-gray-600 mb-4">
              Trading with leverage (margin) or using derivatives can amplify both gains and losses:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li><strong>Margin Calls:</strong> You may be required to deposit additional funds or close positions at a loss</li>
              <li><strong>Amplified Losses:</strong> Small market movements can result in significant losses</li>
              <li><strong>Complex Products:</strong> Derivatives can be difficult to understand and value</li>
              <li><strong>Counterparty Risk:</strong> The other party to the derivative contract may default</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Operational and Technology Risks</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Platform Risks</h3>
            <p className="text-gray-600 mb-4">
              Trading platforms, including The Market Stories' services, may experience technical issues, outages, or errors. This could prevent you from executing trades, monitoring positions, or accessing your funds.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Connectivity Risks</h3>
            <p className="text-gray-600 mb-4">
              Internet connectivity issues, power outages, or device failures can prevent you from managing your investments effectively.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Cyber Security Risks</h3>
            <p className="text-gray-600 mb-4">
              Cyber attacks, hacking, phishing, and other security breaches can compromise your personal information and funds.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Information and Data Risks</h2>
            <p className="text-gray-600 mb-4">
              All market data, news, analysis, and information provided by The Market Stories is for informational purposes only:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li><strong>Not Real-Time:</strong> Data may be delayed, estimated, or sourced from third parties</li>
              <li><strong>Not Guaranteed:</strong> Accuracy, completeness, and timeliness are not guaranteed</li>
              <li><strong>No Advice:</strong> Content does not constitute investment advice or recommendations</li>
              <li><strong>Third-Party Content:</strong> We may republish content from third parties without verification</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Tax and Legal Risks</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.1 Tax Implications</h3>
            <p className="text-gray-600 mb-4">
              Investment activities may have significant tax consequences. Tax laws vary by jurisdiction and can change. You are responsible for understanding and complying with applicable tax laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.2 Legal and Regulatory Risks</h3>
            <p className="text-gray-600 mb-4">
              Financial regulations vary by jurisdiction. Some investments may not be available or legal in your location. You are responsible for ensuring compliance with local laws and regulations.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Psychological and Behavioral Risks</h2>
            <p className="text-gray-600 mb-4">
              Trading and investing can be psychologically challenging:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li><strong>Emotional Decision Making:</strong> Fear and greed can lead to poor investment decisions</li>
              <li><strong>Overconfidence:</strong> Past successes may lead to excessive risk-taking</li>
              <li><strong>Addiction:</strong> Trading can become compulsive and lead to financial ruin</li>
              <li><strong>Stress and Health:</strong> Investment losses can cause significant stress and health issues</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Counterparty and Custody Risks</h2>
            <p className="text-gray-600 mb-4">
              When using third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li><strong>Broker/Dealer Risk:</strong> Your broker or dealer may fail or become insolvent</li>
              <li><strong>Exchange Risk:</strong> Trading venues may halt trading or fail</li>
              <li><strong>Custodian Risk:</strong> Assets held by custodians may not be fully protected</li>
              <li><strong>Insurance Limitations:</strong> SIPC and other insurance may not cover all losses</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Currency and International Risks</h2>
            <p className="text-gray-600 mb-4">
              International investing involves additional risks:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li><strong>Currency Fluctuations:</strong> Foreign exchange rates can affect investment returns</li>
              <li><strong>Political Risk:</strong> Political instability can affect markets and investments</li>
              <li><strong>Economic Risk:</strong> Different economic conditions and policies</li>
              <li><strong>Settlement Risk:</strong> Delays or failures in international settlements</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Suitability and Risk Tolerance</h2>
            <p className="text-gray-600 mb-4">
              Not all investments are suitable for all investors. You should:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Assess your financial situation, investment objectives, and risk tolerance</li>
              <li>Understand the specific risks of each investment</li>
              <li>Only invest money you can afford to lose</li>
              <li>Consider diversifying your investments</li>
              <li>Consult with qualified financial professionals</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. No Guarantees or Warranties</h2>
            <p className="text-gray-600 mb-4">
              The Market Stories makes no guarantees or warranties regarding:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>The accuracy, completeness, or timeliness of any information</li>
              <li>The performance of any investment or strategy</li>
              <li>The availability or functionality of our services</li>
              <li>Future market conditions or economic outcomes</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              To the fullest extent permitted by law, The Market Stories shall not be liable for any losses, damages, or costs arising from:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Relying on information provided by The Market Stories</li>
              <li>Investment decisions or trading activities</li>
              <li>Technical issues or service interruptions</li>
              <li>Third-party actions or omissions</li>
              <li>Market volatility or economic conditions</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Professional Advice Recommended</h2>
            <p className="text-gray-600 mb-4">
              <strong>ALWAYS consult with qualified financial professionals before making investment decisions.</strong> This includes:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>Certified Financial Planners (CFP)</li>
              <li>Registered Investment Advisors (RIA)</li>
              <li>Certified Public Accountants (CPA)</li>
              <li>Licensed attorneys specializing in financial matters</li>
              <li>Tax professionals</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Professional advice should be tailored to your specific financial situation, goals, and risk tolerance.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Acknowledgment and Acceptance</h2>
            <p className="text-gray-600 mb-4">
              By using The Market Stories or engaging in any investment activities, you acknowledge that:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
              <li>You have read and understood this Risk Disclosure</li>
              <li>You accept all risks associated with financial markets and investing</li>
              <li>You are solely responsible for your investment decisions</li>
              <li>You will not hold The Market Stories liable for any losses or damages</li>
              <li>You will conduct your own research and due diligence</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>⚠️ WARNING:</strong> Investing involves risk of loss. Past performance does not guarantee future results. Only invest money you can afford to lose. Consult professionals before investing.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">16. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about this Risk Disclosure or need clarification, please contact us:
            </p>
            <p className="text-gray-600 mb-4">
              Email: support@themarketstories.com<br />
              Support: support@themarketstories.com
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
